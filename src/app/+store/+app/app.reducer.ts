import { createReducer, on, Action } from '@ngrx/store';
import * as AppActions from './app.actions';
import {
  IAppointment,
  IAvailabilityQueue,
  IAvailabilitySchedule,
  IForm,
  IService
} from '@appgen-health-crm/api-interfaces';
import { IUserDetails } from '../../components/details-form/details-form.component';
import { PaymentMethod, Token } from '@stripe/stripe-js';
import { getHours, getMinutes } from 'date-fns';

export const FEATURE_KEY = 'app';

export interface State {
  mode: 'appointment' | 'form' | 'status' | null; // depends on if formId exist in the url query params
  appointment: Partial<IAppointment>;
  apptId: string;
  apptKey: string;
  loading: boolean;
  service: {
    valid: boolean;
    selectedId: string;
    services: IService[];
  };
  form: IForm;
  availability: IAvailabilitySchedule | IAvailabilityQueue;
  selectedDate: string;
  selectedMinute: string;
  userDetails: Partial<IUserDetails>; // shared between form mode and appointment mode
  userDetailsValid: boolean;
  userDetailsDone: boolean;
  showValidationFeedback: boolean;
  stripeToken: PaymentMethod;
  paymentValid: boolean;
  consentSection: string;
  referralCode: string;
}
// can submit if selectedService && selectedDate && selectedMinute && userDetailsValid

export interface AppPartialState {
  readonly [FEATURE_KEY]: State;
}

export const initialState: State = {
  mode: null,
  apptId: null,
  apptKey: null,
  appointment: null,
  loading: false,
  service: {
    selectedId: null,
    valid: false,
    services: []
  },
  form: null,
  availability: null,
  selectedMinute: null,
  selectedDate: null,
  userDetails: null,
  userDetailsValid: false,
  userDetailsDone: false,
  showValidationFeedback: false,
  stripeToken: null,
  paymentValid: false,
  consentSection: '',
  referralCode: null
};

const appReducer = createReducer(
  initialState,
  /* --------------------------------- init -------------------------------- */
  on(
    AppActions.setAppMode,
    (state, { mode, _ref, formId, apptId, apptKey }) => ({
      ...state,
      mode: mode,
      referralCode: _ref,
      apptId,
      apptKey
    })
  ),

  /* ------------------------------- reschedule ------------------------------- */
  on(AppActions.rescheduleAppointment, (state, {}) => ({
    ...state,
    mode: 'appointment'
  })),

  /* --------------------------------- payment -------------------------------- */
  on(AppActions.paymentValid, (state, { valid }) => ({
    ...state,
    paymentValid: valid
  })),

  /* --------------------------------- loading -------------------------------- */
  on(AppActions.showLoading, state => ({
    ...state,
    loading: true
  })),
  on(AppActions.hideLoading, state => ({
    ...state,
    loading: false
  })),

  /* ----------------------------- consent Section ---------------------------- */
  on(AppActions.getConsentSection, (state, {}) => ({
    ...state,
    loading: true
  })),
  on(AppActions.getConsentSectionSuccess, (state, { consentHTML }) => ({
    ...state,
    consentSection: consentHTML,
    loading: false
  })),
  on(AppActions.getConsentSectionFailure, (state, { error }) => ({
    ...state,
    loading: false
  })),

  /* --------------------------------- service -------------------------------- */

  on(AppActions.toggleService, (state, { serviceId }) => ({
    ...state,
    service: {
      ...state.service,
      selectedId: state.service.selectedId === serviceId ? null : serviceId, // allow toggling
      valid: true
    },
    // reset date
    selectedDate: null,
    // reset time
    selectedMinute: null
  })),

  on(AppActions.loadAvailableServices, state => ({
    ...state,
    loading: true
  })),

  on(AppActions.loadAvailableServicesSuccess, (state, { services }) => ({
    ...state,
    loading: false,
    service: {
      ...state.service,
      services
    }
  })),

  on(AppActions.loadAvailableServicesFailure, (state, { error }) => ({
    ...state,
    loading: false
  })),

  on(AppActions.loadScheduleAvailability, (state, { serviceId }) => ({
    ...state,
    loading: true,
    availability: {}
  })),

  on(AppActions.loadScheduleAvailabilitySuccess, (state, { availability }) => ({
    ...state,
    loading: false,
    availability: availability
  })),

  on(AppActions.loadScheduleAvailabilityFailure, (state, { error }) => ({
    ...state,
    loading: false,
    availability: {}
  })),
  /* ---------------------------------- date ---------------------------------- */

  on(AppActions.selectDate, (state, { date }) => ({
    ...state,
    selectedDate: state.selectedDate === date ? null : date,
    // reset time after selecting date
    selectedMinute: null
  })),

  /* ---------------------------------- time ---------------------------------- */

  on(AppActions.selectTime, (state, { time }) => ({
    ...state,
    selectedMinute: time
  })),

  on(AppActions.resetTime, state => ({
    ...state,
    selectedDate: null,
    selectedMinute: null
  })),

  on(AppActions.changeDetails, (state, { details, valid }) => ({
    ...state,
    userDetails: details,
    userDetailsValid: valid
  })),

  on(AppActions.detailsDone, (state, { done }) => ({
    ...state,
    showValidationFeedback: true,
    userDetailsDone: done && state.userDetailsValid
  })),

  on(AppActions.submitAppointment, state => ({
    ...state,
    loading: state.userDetailsValid,
    showValidationFeedback: true
  })),

  on(AppActions.submitAppointmentSuccess, state => ({
    ...state,
    loading: false
  })),

  on(AppActions.submitAppointmentFailure, (state, { error }) => ({
    ...state,
    loading: false
  })),

  /* -------------------------------------------------------------------------- */
  /*                                 Appointment                                */
  /* -------------------------------------------------------------------------- */
  on(AppActions.loadAppointment, (state, { apptId, apptKey }) => ({
    ...state,
    loading: true
  })),

  on(
    AppActions.loadAppointmentSuccess,
    (state, { _id, extras, lead, reservation, service, status }) => ({
      ...state,
      appointment: { _id, status },
      loading: false,
      service: {
        ...state.service,
        selectedId: service._id
      },
      userDetails: {
        ...lead,
        ...extras,
        ...lead.extras
      },
      selectedDate: new Date(reservation).toISOString().slice(0, 10),
      selectedMinute:
        getHours(new Date(reservation)) * 60 +
        getMinutes(new Date(reservation)) +
        ''
    })
  ),

  on(AppActions.loadAppointmentFailure, (state, { error }) => ({
    ...state,
    loading: false
  })),
  /* -------------------------------------------------------------------------- */
  /*                                  cancel                                    */
  /* -------------------------------------------------------------------------- */
  // get form
  on(AppActions.cancelAppointmentAndSubmitNew, (state, {}) => ({
    ...state,
    loading: true
  })),
  on(AppActions.cancelAppointment, (state, {}) => ({
    ...state,
    loading: true
  })),

  on(AppActions.cancelAppointmentSuccess, (state, {}) => ({
    ...state,
    loading: false
  })),

  on(AppActions.cancelAppointmentFailure, (state, { error }) => ({
    ...state,
    loading: false
  })),
  /* -------------------------------------------------------------------------- */
  /*                                  Form Mode                                 */
  /* -------------------------------------------------------------------------- */
  // get form
  on(AppActions.getForm, (state, { formId }) => ({
    ...state,
    loading: true
  })),

  on(AppActions.getFormSuccess, (state, { form }) => ({
    ...state,
    loading: false,
    form
  })),

  on(AppActions.getFormFailure, (state, { error }) => ({
    ...state,
    loading: false
  })),

  /* -------------------------------------------------------------------------- */
  /*                                 health card                                */
  /* -------------------------------------------------------------------------- */

  on(AppActions.setHc, (state, { hc }) => ({
    ...state,
    userDetails: { ...state.userDetails, hc }
  })),

  on(AppActions.resetHC, state => ({
    ...state,
    userDetails: { ...state.userDetails, hc: null }
  })),

  /* -------------------------------------------------------------------------- */
  /*                                 Credit Card                                */
  /* -------------------------------------------------------------------------- */

  on(AppActions.setStripeToken, (state, { stripeToken }) => ({
    ...state,
    stripeToken
  })),

  on(AppActions.resetStripeToken, state => ({
    ...state,
    stripeToken: null
  })),

  // submit form
  on(AppActions.submitForm, (state, {}) => ({
    ...state,
    loading: true,
    showValidationFeedback: true
  })),

  on(AppActions.submitFormSuccess, (state, { form }) => ({
    ...state,
    loading: false
  })),

  on(AppActions.submitFormFailure, (state, { error }) => ({
    ...state,
    loading: false
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return appReducer(state, action);
}
