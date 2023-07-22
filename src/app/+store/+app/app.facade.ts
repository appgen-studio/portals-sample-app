import { Injectable } from '@angular/core';
import { select, Store, Action } from '@ngrx/store';

import * as fromApp from './app.reducer';
import * as AppSelectors from './app.selectors';
import * as AppActions from './app.actions';
import { IUserDetails } from '../../components/details-form/details-form.component';
import { DOC_ORIENTATION, NgxImageCompressService } from 'ngx-image-compress';
import { PaymentMethod, Token } from '@stripe/stripe-js';
import { IOntarioHealthCard } from '../../../../../../libs/api-interfaces/src';

@Injectable({
  providedIn: 'root'
})
export class AppFacade {
  appointmentDetails$ = this.store.pipe(
    select(AppSelectors.selectAppointmentDetails)
  );
  appState$ = this.store.pipe(select(AppSelectors.selectState));
  loading$ = this.store.pipe(select(AppSelectors.selectLoading));
  mode$ = this.store.pipe(select(AppSelectors.selectMode));
  form$ = this.store.pipe(select(AppSelectors.selectForm));
  payment$ = this.store.pipe(select(AppSelectors.selectPayment));
  paymentValid$ = this.store.pipe(select(AppSelectors.isPaymentValidSelector));
  paymentStepCond$ = this.store.pipe(
    select(AppSelectors.selectPaymentStepCond)
  );
  paymentEnabled$ = this.store.pipe(
    select(AppSelectors.isPaymentEnabledSelector)
  );
  showValidationFeedback$ = this.store.pipe(
    select(AppSelectors.selectShowValidationFeedback)
  );
  selectedService$ = this.store.pipe(
    select(AppSelectors.activeServiceSelector)
  );
  availableServices$ = this.store.pipe(
    select(AppSelectors.getAvailableServices)
  );
  userDetails$ = this.store.pipe(select(AppSelectors.selectUserDetails));
  userDetailsValid$ = this.store.pipe(
    select(AppSelectors.selectUserDetailsValid)
  );
  userDetailsDone$ = this.store.pipe(
    select(AppSelectors.selectUserDetailsDone)
  );
  availableDates$ = this.store.pipe(
    select(AppSelectors.getAvailableDates)
    // tap(res => console.log(res))
  );
  availableTimes$ = this.store.pipe(select(AppSelectors.getAvailableTimes));
  selectedDate$ = this.store.pipe(select(AppSelectors.selectedDate));
  selectedTime$ = this.store.pipe(select(AppSelectors.selectedTime));
  consentSection$ = this.store.pipe(select(AppSelectors.selectConsentSection));
  isValidAppointmentRequest$ = this.store.pipe(
    select(AppSelectors.isValidAppointmentRequest)
  );
  stripeToken$ = this.store.pipe(select(AppSelectors.selectStripeToken));
  readyToSubmit$ = this.store.pipe(select(AppSelectors.selectReadyToSubmit));

  constructor(
    private store: Store<fromApp.AppPartialState>,
    private imageCompress: NgxImageCompressService
  ) {}

  private dispatch(action: Action) {
    this.store.dispatch(action);
  }

  preSubmit() {
    this.dispatch(AppActions.preSubmitAppointment());
  }
  setPaymentValid(valid: boolean) {
    this.dispatch(AppActions.paymentValid({ valid }));
  }
  showLoading() {
    this.dispatch(AppActions.showLoading());
  }
  hideLoading() {
    this.dispatch(AppActions.hideLoading());
  }

  cancelAppointment() {
    this.dispatch(AppActions.cancelAppointment());
  }

  rescheduleAppointment() {
    this.dispatch(AppActions.rescheduleAppointment());
  }

  loadApp() {
    this.dispatch(AppActions.loadApp());
  }

  loadAvailableServices() {
    this.dispatch(AppActions.loadAvailableServices());
  }

  toggleService(serviceId: string) {
    this.dispatch(AppActions.toggleService({ serviceId }));
  }

  selectDate(date: string) {
    this.dispatch(AppActions.selectDate({ date }));
  }

  selectTime(time: string) {
    this.dispatch(AppActions.selectTime({ time }));
  }

  changeDetails(details: Partial<IUserDetails>, valid: boolean) {
    this.dispatch(AppActions.changeDetails({ details, valid }));
  }

  resetTime() {
    this.dispatch(AppActions.resetTime());
  }

  setStripeToken(stripeToken: PaymentMethod) {
    this.dispatch(AppActions.setStripeToken({ stripeToken }));
  }

  resetStripeToken() {
    this.dispatch(AppActions.resetStripeToken());
  }

  submitAppointment() {
    this.dispatch(AppActions.submitAppointment());
  }

  getConsentSection() {
    this.dispatch(AppActions.getConsentSection());
  }

  getForm(formId: string) {
    this.dispatch(AppActions.getForm({ formId }));
  }

  submitForm() {
    this.dispatch(AppActions.submitForm());
  }

  setHc(hc: IOntarioHealthCard) {
    this.dispatch(AppActions.setHc({ hc }));
  }

  resetHC() {
    this.dispatch(AppActions.resetHC());
  }

  setUserDetailsDone(done: boolean) {
    this.dispatch(AppActions.detailsDone({ done }));
  }

  async compressFile(original: string) {
    try {
      const size = this.imageCompress.byteCount(original) / 1024;
      if (size < 200) {
        // no need to compress; already too small
        return original;
      }
      if (!original.startsWith('data:image')) {
        console.info('no compression for non image files');
        return original;
      }
      console.info('selected file size =', size, 'Kb');

      const compressed = await this.imageCompress.compressFile(
        original,
        DOC_ORIENTATION.Up,
        50,
        80
      );
      console.info(
        'Size in bytes is now:',
        this.imageCompress.byteCount(compressed) / 1024
      );

      return compressed;
    } catch (error) {
      console.error(error);

      alert('Failed to compress file.');
    }
  }
}
