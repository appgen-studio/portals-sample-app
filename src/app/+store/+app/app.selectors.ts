import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IOntarioHealthCard } from '@appgen-health-crm/api-interfaces';
import { FEATURE_KEY, State, AppPartialState } from './app.reducer';
import { addMinutes, parseISO } from 'date-fns';

export const selectState = createFeatureSelector< State>(
  FEATURE_KEY
);

export const selectMode = createSelector(
  selectState,
  (state: State) => state.mode
);
export const selectLoading = createSelector(
  selectState,
  (state: State) => state.loading
);
export const selectForm = createSelector(
  selectState,
  (state: State) => state.form
);
export const selectShowValidationFeedback = createSelector(
  selectState,
  (state: State) => state.showValidationFeedback
);

export const selectConsentSection = createSelector(
  selectState,
  (state: State) => state.consentSection
);

export const getAvailableServices = createSelector(
  selectState,
  (state: State) => state.service.services
);

export const isQueueSelector = createSelector(
  selectState,
  (state: State) => !!state.availability?.queue
);

export const getAvailableDates = createSelector(
  selectState,
  isQueueSelector,
  (state: State, isQueue: boolean) =>
    state.availability && !isQueue
      ? Object.keys(state.availability).sort((a, b) => (a < b ? -1 : 1))
      : []
);

export const getAvailableTimes = createSelector(selectState, (state: State) =>
  state.availability ? state.availability[state.selectedDate] : []
);

export const activeServiceSelector = createSelector(
  selectState,
  (state: State) =>
    state.service.selectedId
      ? state.service.services.find(
          service => service._id === state.service.selectedId
        )
      : null
);
export const selectedDate = createSelector(
  selectState,
  (state: State) => state.selectedDate
);
export const selectedTime = createSelector(
  selectState,
  (state: State) => state.selectedMinute
);

export const selectUserDetails = createSelector(
  selectState,
  (state: State) => state.userDetails
);

export const selectUserDetailsDone = createSelector(
  selectState,
  (state: State) => state.userDetailsDone
);

export const selectUserDetailsValid = createSelector(
  selectState,
  (state: State) => state.userDetailsValid
);

// selectedService && selectedDate && selectedMinute && userDetailsValid
export const isValidAppointmentRequest = createSelector(
  selectState,
  (state: State) =>
    state.service?.selectedId &&
    state.selectedDate &&
    state.selectedMinute &&
    state.userDetailsValid
);

export const selectStripeToken = createSelector(
  selectState,
  state => state.stripeToken
);

export const selectPayment = createSelector(
  activeServiceSelector,
  service => service?.payment
);

export const isPaymentEnabledSelector = createSelector(
  activeServiceSelector,
  service => service?.payment?.enabled
);

export const selectPaymentStepCond = createSelector(
  selectState,
  isPaymentEnabledSelector,
  (state, paymentEnabled) => state.userDetailsDone && paymentEnabled
);

export const isPaymentValidSelector = createSelector(
  selectState,
  isPaymentEnabledSelector,
  (state, isPaymentEnabled) => !isPaymentEnabled || state.paymentValid
);

export const isDateTimeValidSelector = createSelector(
  selectedDate,
  selectedTime,
  (date, time) => !!date && !!time
);

export const isLoadSelector = createSelector(
  selectedDate,
  selectedTime,
  (date, time) => !!date && !!time
);

export const selectReadyToSubmit = createSelector(
  selectState,
  selectMode,
  isPaymentValidSelector,
  isQueueSelector,
  isDateTimeValidSelector,
  (state, mode, isPaymentValid, isQueue, isDateTimeValid) => {
    if (mode === 'form') {
      return !state.loading;
    } else {
      // 'appointment' mode
      return isPaymentValid && (!!isQueue || isDateTimeValid);
    }
  }
);
export const getSubmitRequest = createSelector(
  selectState,
  activeServiceSelector,
  (state, service) => {
    return { state, service };
  }
);
export const selectAppointmentDetails = createSelector(
  selectState,
  activeServiceSelector,
  (state, service) => {
    return {
      status: state.appointment?.status,
      reservation:
        state.selectedDate &&
        state.selectedMinute &&
        addMinutes(
          parseISO(state.selectedDate),
          parseInt(state.selectedMinute)
        ),
      service: service?.label
    };
  }
);
