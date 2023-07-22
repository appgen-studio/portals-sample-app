import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  PaymentMethod,
  StripeCardElementOptions,
  StripeElementsOptions,
  Token
} from '@stripe/stripe-js';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { AppFacade } from '../../+store/+app/app.facade';
import { takeWhile } from 'rxjs/operators';
import {
  IOntarioHealthCard,
  IServicePayment
} from '@care-portals/api-interfaces';
import { OntarioHcComponent } from '@care-portals/ui';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.less']
})
export class PaymentComponent implements OnInit, OnDestroy {
  constructor(
    private facade: AppFacade,
    private stripeService: StripeService
  ) {}
  active = true;
  payment: IServicePayment;
  hcType: string;
  @ViewChild(StripeCardComponent) card: StripeCardComponent;
  @ViewChild(OntarioHcComponent) hcComponent: OntarioHcComponent;
  paymentMethod: 'credit' | 'hc' = 'hc';
  stripeError: string;
  hcError: string;
  loading: boolean;
  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '14px',
        '::placeholder': {
          color: '#CFD7E0'
        }
      }
    }
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  stripeFG = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  get amount() {
    const priceAfterHcCover = this.useHc
      ? this.price - (this.price * this.hcCoverage) / 100
      : this.price;
    const priceFormatted = Math.round(priceAfterHcCover * 100) / 100;
    return priceFormatted;
  }

  hc: { value: IOntarioHealthCard; valid: boolean } = {
    valid: false,
    value: null
  };
  stripeToken: PaymentMethod;
  price: number;
  currency: string;
  useHc = false;
  canUseHc: boolean;
  hcCoverage: number;
  hcFullCover: boolean;
  paymentValid: boolean;
  hcPatched: boolean;

  ngOnInit() {
    // get clinic payment data
    combineLatest([this.facade.selectedService$, this.facade.userDetails$])
      .pipe(takeWhile(() => this.active))
      .subscribe(([service, details]) => {
        const qtyField = service?.payment?.qtyField;
        const qty = +details?.[qtyField] || 1;
        const depsCount = details.dependents?.length || 0;
        const extraPricePerDependent = service.extraPricePerDependent || 0;

        this.price =
          (service?.payment?.price || 0) * qty +
          extraPricePerDependent * depsCount;
        this.currency = service?.payment?.currency;
        this.hcCoverage = service?.payment?.hcCoverage;
        this.canUseHc = service?.payment?.hcCoverage > 0;
        this.hcFullCover = service?.payment?.hcCoverage == 100;
        if (this.hcFullCover) this.useHc = true; // default to hc for full covered services

        const province = details?.province || details?.['address.province'];
        this.hcType = province === 'ON' ? 'ontario' : 'generic';
        /* ----------------------------------- hc ----------------------------------- */
        // use hc by default if user entered hc info in details step and coverage over 0%
        this.useHc = this.canUseHc && !!details?.hc;
        // get hc value and patch it to component
        this.patchHcValueInitial(details?.hc);
      });

    this.facade.stripeToken$
      .pipe(takeWhile(() => this.active))
      .subscribe(stripeToken => {
        this.stripeToken = stripeToken;
      });

    this.facade.paymentValid$
      .pipe(takeWhile(() => this.active))
      .subscribe(paymentValid => {
        this.paymentValid = paymentValid;
      });
  }

  async getToken() {
    this.loading = true;
    await this.validateAndGoNext();
    this.loading = false;
  }

  patchHcValueInitial(value: IOntarioHealthCard) {
    if (this.hcPatched) return;
    setTimeout(() => {
      this.hcComponent?.patchValue(value);
      this.hcPatched = true;
    });
  }

  async validateAndGoNext() {
    this.stripeError = '';
    this.hcError = '';
    let isHCValid = true;
    let isCreditCardValid = true;

    const validateCreditCard = !!this.card;
    const validateHC = !!this.hcComponent;

    if (validateCreditCard) {
      this.stripeToken =
        this.stripeToken ||
        ((await this.validateCreditCardAndGetToken()) as any);
      isCreditCardValid = !!this.stripeToken;
    }

    if (validateHC) {
      this.hcComponent.markAsDirty();
      console.log('Validate hc ***** ', this.hc);

      if (!this.hc.value.hcNum || !this.hc?.valid) {
        isHCValid = false;
      }
    }

    if (!isHCValid) {
      this.facade.setPaymentValid(false);
      this.hcError = 'Please enter your health card info';
      return;
    }
    if (!isCreditCardValid) {
      this.facade.setPaymentValid(false);
      this.stripeError = 'Please enter your credit card info';
      return;
    }

    if (validateCreditCard) {
      this.facade.setStripeToken(this.stripeToken);
    } else {
      this.facade.resetStripeToken();
    }

    this.facade.setPaymentValid(true);
  }

  async validateCreditCardAndGetToken(): Promise<Token> {
    // validations
    if (this.stripeFG.invalid) {
      for (const key in this.stripeFG.controls) {
        if (Object.prototype.hasOwnProperty.call(this.stripeFG.controls, key)) {
          this.stripeFG.controls[key].markAsDirty();
          this.stripeFG.controls[key].updateValueAndValidity();
        }
      }
      return null;
    }

    // create a stripe token to charge the customer with it
    const name = this.stripeFG.get('name').value;
    const result = await this.stripeService
      .createToken(this.card.element, { name })
      .toPromise();

    if (result.token) {
      // Use the token
      //  TODO put the token in store
      return result.token;
    } else if (result.error) {
      // Error creating the token
      this.stripeError = result.error.message;
      return null;
    }
  }

  ngOnDestroy() {
    this.active = false;
  }

  resetHc() {
    this.hcComponent.resetForm();
    this.facade.resetHC();
  }

  closeHc() {
    this.useHc = false;
  }

  resetStripeToken() {
    this.card?.element?.clear();
    this.stripeFG.reset();
    this.facade.resetStripeToken();
  }

  handleHcChange(e: { value: IOntarioHealthCard; valid: boolean }) {
    this.hc = e;
    this.facade.setHc(e.value);
  }
}
