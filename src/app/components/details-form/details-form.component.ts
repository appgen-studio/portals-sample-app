import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { take, takeWhile } from 'rxjs/operators';
import { AppFacade } from '../../+store/+app/app.facade';
import {
  IForm,
  IFormField,
  IOntarioHealthCard
} from '@appgen-health-crm/api-interfaces';
import { ActivatedRoute } from '@angular/router';
export interface IUserDetails {
  fullName: string;
  dob: Date;
  email: string;
  hc: IOntarioHealthCard;
  phone?: string;
  province?: string;
  dependents?: any[];
}

export interface DetailsFormEvent {
  valid: boolean;
  value: IUserDetails;
}
@Component({
  selector: 'details-form',
  templateUrl: './details-form.component.html',
  styleUrls: ['./details-form.component.less']
})
export class DetailsFormComponent implements OnInit, OnDestroy {
  constructor(
    private readonly facade: AppFacade,
    private readonly activateRoute: ActivatedRoute
  ) { }

  detailsFG: FormGroup;
  fields: IFormField[];
  showValidation: boolean;
  userDetails: Partial<IUserDetails>;
  isValid: boolean;
  done: boolean;
  paymentEnabled: boolean;
  active = true;
  loading = false;
  busy = false;
  ngOnInit(): void {
    this.facade.paymentEnabled$
      .pipe(takeWhile(() => this.active))
      .subscribe(value => (this.paymentEnabled = value));

    this.facade.appState$
      .pipe(takeWhile(() => this.active))
      .subscribe(state => {
        if (state.mode === 'appointment') {
          const selectedService = state.service.selectedId
            ? state.service.services.find(
              service => service._id === state.service.selectedId
            )
            : null;

          this.fields =
            (selectedService?.fields && selectedService.fields.length
              ? selectedService?.fields
              : null) ||
            (selectedService?.form as IForm)?.fields ||
            [];
        }
        if (state.mode === 'form') {
          this.fields = state.form?.fields;
        }
        this.showValidation = state.showValidationFeedback;
        this.userDetails = state.userDetails;
        this.isValid = state.userDetailsValid;
        this.done = state.userDetailsDone;

      });
      // pre populate email from the url
      const prefillEmail = this.activateRoute.snapshot.queryParamMap.get('email');
      console.log('preillEmail >> ', prefillEmail);
      this.facade.changeDetails({ email: prefillEmail }, false)
  }

  ngOnDestroy() {
    this.active = false;
  }

  onChangeHandler(event: { values: any; valid: boolean }) {
    this.facade.changeDetails(event.values, event.valid);
  }

  onReadyHandler() {
    this.busy = false;
  }

  onBusyHandler() {
    this.busy = true;
  }

  setDone(done: boolean) {
    this.loading = true;
    setTimeout(() => {
      if (this.busy) {
        return;
      }
      this.facade.setUserDetailsDone(done);
      this.loading = false;
    }, 500);
  }
}
