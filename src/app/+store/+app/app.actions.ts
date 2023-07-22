import { createAction, props } from '@ngrx/store';
import { IUserDetails } from '../../components/details-form/details-form.component';
import {
  AppointmentStatus,
  IAppointment,
  IAvailabilityQueue,
  IAvailabilitySchedule,
  IBaseResponse,
  IForm,
  ILead,
  IOntarioHealthCard,
  IService
} from '@care-portals/api-interfaces';
import { PaymentMethod, Token } from '@stripe/stripe-js';

export const loadApp = createAction('[APP] Load App');

export const setAppMode = createAction(
  '[APP] Set App Mode',
  props<{
    mode: 'appointment' | 'form' | 'status';
    _ref: string;
    formId: string;
    apptId: string;
    apptKey: string;
  }>()
);

export const loadAppFailure = createAction(
  '[APP] Load App Failure',
  props<{ error: Error }>()
);

export const submitAppointment = createAction('[App] Submit Appointment');
export const preSubmitAppointment = createAction(
  '[App] Pre Submit Appointment'
);

export const submitAppointmentSuccess = createAction(
  '[App] Submit Appointment Success',
  props<{ appointment: IAppointment; form?: any }>()
);

export const submitAppointmentFailure = createAction(
  '[App] Submit Appointment Failure',
  props<{ error: Error }>()
);

export const showLoading = createAction('[App] Show Loading');

export const hideLoading = createAction('[App] Hide Loading');

export const loadAppointment = createAction(
  '[Service] load appointment',
  props<{ apptId: string; apptKey?: string }>()
);

export const loadAppointmentSuccess = createAction(
  '[Service] load appointment success',
  props<{
    reservation: string;
    status: AppointmentStatus;
    service: IService;
    lead: ILead;
    extras: any;
    _id: string;
  }>()
);

export const loadAppointmentFailure = createAction(
  '[Service] load appointment failure',
  props<{ error: Error }>()
);

export const rescheduleAppointment = createAction(
  '[Service] Reschedule appointment'
);

export const cancelAppointment = createAction('[Service] cancel appointment');
export const cancelAppointmentAndSubmitNew = createAction(
  '[Service] cancel appointment And Submit New'
);

export const cancelAppointmentSuccess = createAction(
  '[Service] cancel appointment success'
);

export const cancelAppointmentFailure = createAction(
  '[Service] cancel appointment failure',
  props<{ error: Error }>()
);

// SERVICE
export const toggleService = createAction(
  '[Service] Toggle Service',
  props<{ serviceId: string }>()
);

export const loadAvailableServices = createAction(
  '[Service] load available services'
);

export const loadAvailableServicesSuccess = createAction(
  '[Service] load available services success',
  props<{ services: IService[] }>()
);

export const loadAvailableServicesFailure = createAction(
  '[Service] load available services failure',
  props<{ error: Error }>()
);

// SCHEDULE
export const loadScheduleAvailability = createAction(
  '[Schedule] Load Schedule Availability',
  props<{ serviceId: string }>()
);

export const loadScheduleAvailabilitySuccess = createAction(
  '[Schedule] Load Schedule Availability Success',
  props<{ availability: IAvailabilitySchedule | IAvailabilityQueue }>()
);

export const loadScheduleAvailabilityFailure = createAction(
  '[Schedule] Load Schedule Availability failure',
  props<{ error: Error }>()
);

export const selectDate = createAction(
  '[Schedule] Select Date',
  props<{ date: string }>()
);

export const selectTime = createAction(
  '[Schedule] Select Time',
  props<{ time: string }>()
);
export const resetTime = createAction('[Schedule] Reset Time');

export const changeDetails = createAction(
  '[App] Change Details',
  props<{ details: Partial<IUserDetails>; valid: boolean }>()
);

export const detailsDone = createAction(
  '[App] Details Done',
  props<{ done: boolean }>()
);
export const paymentValid = createAction(
  '[App] Payment Valid',
  props<{ valid: boolean }>()
);

export const getConsentSection = createAction('[App] Get consent Section');
export const getConsentSectionSuccess = createAction(
  '[App] Get consent Section Success',
  props<{ consentHTML: string }>()
);
export const getConsentSectionFailure = createAction(
  '[App] Get consent Section Failure',
  props<{ error: Error }>()
);

/* -------------------------------------------------------------------------- */
/*                       form (when formId is provided)                       */
/* -------------------------------------------------------------------------- */
export const getForm = createAction(
  '[Form] load get form',
  props<{ formId: string }>()
);

export const getFormSuccess = createAction(
  '[Form] load get form success',
  props<{ form: IForm }>()
);

export const getFormFailure = createAction(
  '[Form] load get form failure',
  props<{ error: Error }>()
);

/* -------------------------------------------------------------------------- */
/*                                Health Card                                 */
/* -------------------------------------------------------------------------- */

export const setHc = createAction(
  '[Payment] Update HC',
  props<{ hc: IOntarioHealthCard }>()
);

export const resetHC = createAction('[Payment] Reset HC');

/* -------------------------------------------------------------------------- */
/*                                 Credit Card                                */
/* -------------------------------------------------------------------------- */

export const setStripeToken = createAction(
  '[Payment] Set Stripe Token',
  props<{ stripeToken: PaymentMethod }>()
);

export const resetStripeToken = createAction('[Payment] Reset Stripe Token');

/* -------------------------------------------------------------------------- */
/*                                    Submit                                  */
/* -------------------------------------------------------------------------- */

export const submitForm = createAction('[Form] submit form');

export const submitFormSuccess = createAction(
  '[Form] submit form success',
  props<{ form: any }>()
);

export const submitFormFailure = createAction(
  '[Form] submit form failure',
  props<{ error: Error }>()
);

export const nullAction = createAction('[App] Null Action');
