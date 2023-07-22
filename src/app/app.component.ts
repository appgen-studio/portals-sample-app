import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppFacade } from './+store/+app/app.facade';
import { IService } from '@appgen-health-crm/api-interfaces';
import { takeWhile } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { StripeCardComponent, StripeService } from 'ngx-stripe';
import { PaymentMethod, Token } from '@stripe/stripe-js';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'appgen-booking-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  mode: 'appointment' | 'form' | 'status' | null = null;
  // when this is provided then the app will act as a form component only
  formId: string;
  isLoading = false;
  selectedService: IService;
  isDateSelected: boolean;
  isTimeSelected: boolean;
  userDetailsValid: boolean;
  active = true;
  consentHTML = '';
  assetsURI = environment.assetsURI;
  isValidAppointmentRequest$ = this.facade.isValidAppointmentRequest$;
  stripeError = '';
  stripeToken: PaymentMethod;
  isPaymentEnabled: boolean;
  isPaymentValid: boolean;
  paymentStepCond$ = this.facade.paymentStepCond$;
  isReadyToSubmit = false;

  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  stripeFG = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  constructor(
    private facade: AppFacade,
    private stripeService: StripeService
  ) {}

  get paymentCond() {
    return this.userDetailsValid;
  }

  get isQueue() {
    return (
      this.selectedService?.isQueue ||
      this.selectedService?.assignmentStrategy === 'queue'
    );
  }

  ngOnInit() {
    this.facade.loading$.subscribe(loading => (this.isLoading = loading));

    this.facade.mode$.pipe(takeWhile(() => this.active)).subscribe(mode => {
      if (mode === 'appointment') {
        this.initAppointmentApp();
      }
      this.mode = mode;
    });
    // TODO @tamim73 move this logic to the app state. only have initApp action here instead to trigger this logic in an effect.
    // const urlParams = new URLSearchParams(window.location.search);
    // this.formId = window['formId'] || urlParams.get('formId');

    // const referralCode = urlParams.get('_ref');
    // if (referralCode) {
    //   this.facade.setReferralCode(referralCode);
    // }

    this.facade.loadApp();

    /* -------------- Common between Form mode and appointment mode ------------- */
    this.facade.consentSection$
      .pipe(takeWhile(() => this.active))
      .subscribe(consentHTML => {
        this.consentHTML = consentHTML;
      });
    this.facade.getConsentSection();
    this.facade.readyToSubmit$.subscribe(res => {
      console.log('readyToSubmit$ >>', res);
      this.isReadyToSubmit = res;
    });
  }

  // initFormApp() {
  //   this.facade.getForm(this.formId);
  // }

  initAppointmentApp() {
    /* -------------------------------------------------------------------------- */
    /*                              Appointment mode                              */
    /* -------------------------------------------------------------------------- */
    // normal appointment mode
    this.facade.selectedService$
      .pipe(takeWhile(() => this.active))
      .subscribe(service => (this.selectedService = service));

    this.facade.selectedDate$
      .pipe(takeWhile(() => this.active))
      .subscribe(res => {
        this.isDateSelected = !!res;
      });

    this.facade.selectedTime$
      .pipe(takeWhile(() => this.active))
      .subscribe(res => {
        this.isTimeSelected = !!res;
      });

    this.facade.paymentEnabled$
      .pipe(takeWhile(() => this.active))
      .subscribe(res => {
        this.isPaymentEnabled = !!res;
      });

    this.facade.paymentValid$
      .pipe(takeWhile(() => this.active))
      .subscribe(res => {
        this.isPaymentValid = !!res;
      });

    this.facade.userDetailsValid$
      .pipe(takeWhile(() => this.active))
      .subscribe(res => {
        console.log('userDetailsValid', res);

        this.userDetailsValid = res;
      });
  }

  ngOnDestroy() {
    this.active = false;
  }

  selectTime(time: string) {
    this.facade.selectTime(time);
  }

  resetTime() {
    this.facade.resetTime();
  }

  submit() {
    // TODO @tamim73 always depends on the effects to make logical flow changes; therefore, change this to be a simple submit() and in the effect change the mode and fire another action accordingly
    setTimeout(() => {
      if (this.mode === 'appointment') {
        this.facade.preSubmit();
      } else {
        this.facade.submitForm();
      }
    }, 500);
  }

  getConsentSection() {
    this.facade.getConsentSection();
  }

  get submitBtnLabel() {
    return this.mode == 'appointment' ? 'Book Now' : 'Submit';
  }

  resetStripeToken() {
    this.card?.element?.clear();
    this.stripeFG.reset();
    this.facade.resetStripeToken();
  }

  async validateAndGoNext() {
    this.stripeError = '';
    let isCreditCardValid = true;
    const validateCreditCard = !!this.card;

    if (validateCreditCard) {
      this.stripeToken =
        this.stripeToken ||
        ((await this.validateCreditCardAndGetToken()) as any);
      isCreditCardValid = !!this.stripeToken;
    }

    if (!isCreditCardValid) {
      this.stripeError = 'Please enter your credit card info';
      return;
    }

    if (validateCreditCard) {
      this.facade.setStripeToken(this.stripeToken);
    } else {
      this.facade.resetStripeToken();
    }
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
}
