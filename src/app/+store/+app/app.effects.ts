import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { fetch } from '@nx/angular';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import * as appActions from './app.actions';
import * as appState from './app.reducer';
import * as appSelectors from './app.selectors';
import { APIService } from '../../services/api.service';
import { Store } from '@ngrx/store';

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private apiService: APIService,
    private notification: NzNotificationService,
    private store: Store<appState.AppPartialState>
  ) {}

  loadApp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.loadApp),
      map(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('org')) {
          window['organization'] = urlParams.get('org');
        }
        if (urlParams.get('__debug')) {
          window['onSubmitSuccess'] = function (data: any) {
            console.log('onSubmitSuccess', data);
          };
        }

        const referralCode = urlParams.get('_ref');

        let mode: 'status' | 'appointment' | 'form';
        const formId = window['formId'] || urlParams.get('formId');
        const apptId = window['apptId'] || urlParams.get('apptId');
        const apptKey = window['apptKey'] || urlParams.get('apptKey');

        if (formId) {
          mode = 'form';
        } else if (apptId) {
          mode = 'status';
        } else {
          mode = 'appointment';
        }

        return appActions.setAppMode({
          mode,
          _ref: referralCode,
          formId,
          apptId: apptId,
          apptKey: apptKey
        });
      })
    )
  );

  setAppMode$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.setAppMode),
      map(({ mode, _ref, formId, apptId, apptKey }) => {
        if (mode === 'appointment') {
          return appActions.loadAvailableServices();
        } else if (mode === 'form') {
          return appActions.getForm({ formId });
        } else if (mode == 'status') {
          return appActions.loadAppointment({ apptId, apptKey });
        }
      })
    )
  );

  loadAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.loadAppointment),
      fetch({
        run: action => {
          return this.apiService
            .getAppointment(action.apptId, action.apptKey)
            .pipe(
              switchMap(appointment => [
                appActions.loadAvailableServices(),
                appActions.loadAppointmentSuccess({ ...appointment })
              ])
            );
        },
        onError: (action, error) => {
          console.error('Error', error);
          this.notification.error('Error', 'Failed to load appointment');
          return appActions.loadAppointmentFailure({ error });
        }
      })
    )
  );

  reschedule$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.rescheduleAppointment),
      withLatestFrom(this.store.select(appSelectors.selectState)),
      map(([type, state]) =>
        appActions.loadScheduleAvailability({
          serviceId: state.service?.selectedId
        })
      )
    )
  );

  cancelAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.cancelAppointment),
      withLatestFrom(this.store.select(appSelectors.selectState)),
      fetch({
        run: (action, { apptId, apptKey }) => {
          return this.apiService.cancelAppointment(apptId, apptKey).pipe(
            switchMap(() => [
              appActions.loadAppointment({
                apptId,
                apptKey
              })
            ])
          );
        },
        onError: (action, error) => {
          console.error('Error', error);
          this.notification.error('Error', 'Failed to cancel appointment');
          return appActions.cancelAppointmentFailure({ error });
        }
      })
    )
  );

  cancelAppointmentAndSubmitNew$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.cancelAppointmentAndSubmitNew),
      withLatestFrom(this.store.select(appSelectors.selectState)),
      fetch({
        run: (action, { apptId, apptKey }) => {
          return this.apiService
            .cancelAppointment(apptId, apptKey)
            .pipe(map(() => appActions.submitAppointment()));
        },
        onError: (action, error) => {
          console.error('Error', error);
          this.notification.error('Error', 'Failed to reschedule appointment');
          return appActions.cancelAppointmentFailure({ error });
        }
      })
    )
  );

  loadAvailableServices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.loadAvailableServices),
      fetch({
        run: () => {
          return this.apiService.getServices().pipe(
            map(services => {
              const urlParams = new URLSearchParams(window.location.search);
              const filter = window['appgen_filter'];
              const serviceParam: string =
                urlParams.get('service') ||
                urlParams.get('serviceId') ||
                window['service'] ||
                window['serviceId'] ||
                '';

              if (!filter && !serviceParam) return services;
              if (serviceParam) {
                return services.filter(s => s._id === serviceParam);
              } else if (typeof filter === 'string') {
                return services.filter(s => s._id === filter);
              } else if (filter instanceof Array) {
                return services.filter(s => filter.indexOf(s._id) > -1);
              } else if (typeof filter === 'function') {
                return services.filter(filter);
              }
            }),
            map(services =>
              appActions.loadAvailableServicesSuccess({ services })
            )
          );
        },
        onError: (action, error) => {
          console.error('Error', error);
          this.notification.error('Error', 'Failed to load available services');
          return appActions.loadAvailableServicesFailure({ error });
        }
      })
    )
  );

  loadAvailableServicesSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.loadAvailableServicesSuccess),
      map(({ services }) => {
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam: string =
          urlParams.get('service') ||
          urlParams.get('serviceId') ||
          window['service'] ||
          window['serviceId'] ||
          '';
        if (serviceParam) {
          const service = services?.find(
            x =>
              x._id.toLowerCase() === serviceParam.toLowerCase() ||
              x.label.toLowerCase() === serviceParam.toLowerCase()
          );

          if (service) {
            return appActions.toggleService({ serviceId: service._id });
          }
        }
        return appActions.nullAction();
      })
    )
  );

  toggleService$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.toggleService),
      map(({ serviceId }) => appActions.loadScheduleAvailability({ serviceId }))
    )
  );

  loadScheduleAvailability$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.loadScheduleAvailability),
      fetch({
        run: ({ serviceId }) => {
          const today = new Date();
          // const timezoneOffset = today.getTimezoneOffset();
          return this.apiService
            .getAvailability(
              serviceId,
              window['displayAvailability'] || 30, // get next 15 available days
              Intl.DateTimeFormat().resolvedOptions().timeZone
            )
            .pipe(
              map(availability =>
                appActions.loadScheduleAvailabilitySuccess({
                  availability
                })
              )
            );
        },
        onError: (action, error) => {
          console.error('Error', error);
          this.notification.error('Error', 'Failed to load availability');
          return appActions.loadScheduleAvailabilityFailure({ error });
        }
      })
    )
  );

  createAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.submitAppointment),
      withLatestFrom(this.store.select(appSelectors.getSubmitRequest)),
      fetch({
        run: (action, { state, service }) => {
          let reservation = new Date();
          if (!service.isQueue && service.assignmentStrategy !== 'queue') {
            const date = state.selectedDate.split('-').map(d => parseInt(d));
            reservation = new Date(
              date[0],
              date[1] - 1,
              date[2],
              0,
              parseInt(state.selectedMinute)
            );
          }

          return this.apiService
            .submitAppointment({
              serviceId: service._id,
              reservation,
              form: { ...state.userDetails },
              stripeToken: state.stripeToken,
              meta: {
                referralCode: state.referralCode,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            })
            .pipe(
              map(res =>
                appActions.submitAppointmentSuccess({
                  appointment: res,
                  form: { ...state.userDetails }
                })
              )
            );
        },
        onError: (action, error) => {
          console.error('Error', error);
          return appActions.submitAppointmentFailure({ error });
        }
      })
    )
  );

  preSubmitAppointment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.preSubmitAppointment),
      withLatestFrom(this.store.select(appSelectors.getSubmitRequest)),
      map(([action, { service, state }]) => {
        // don't submit the request unless the form is valid
        if (!state.userDetailsValid) {
          return appActions.submitAppointmentFailure({
            error: new Error('Please provide all required fields')
          });
        }
        if (!state.userDetails.email) {
          return appActions.submitAppointmentFailure({
            error: new Error('Email is required')
          });
        }
        if (state.apptId) {
          return appActions.cancelAppointmentAndSubmitNew();
        }
        return appActions.submitAppointment();
      })
    )
  );

  submitAppointmentSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(appActions.submitAppointmentSuccess),
        tap(data => {
          this.notification.success('All set!', 'Appointment Booked');
          if (typeof window['onSubmitSuccess'] === 'function') {
            window['onSubmitSuccess'](data);
          } else if (typeof window['agSubmitSuccess'] === 'function') {
            window['agSubmitSuccess'](data);
          } else {
            window.location.href = '/booking-success';
          }
        })
      ),
    {
      dispatch: false
    }
  );

  submitAppointmentFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(appActions.submitAppointmentFailure),
        tap(({ error }) => {
          this.notification.error(
            'Oops',
            error.message || 'Failed to submit appointment'
          );
        })
      ),
    {
      dispatch: false
    }
  );

  getConsentSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.getConsentSection),
      fetch({
        run: (action, state) => {
          return this.apiService
            .getConsentSection()
            .pipe(
              map(({ consentHTML }) =>
                appActions.getConsentSectionSuccess({ consentHTML })
              )
            );
        },
        onError: (action, error) => {
          console.error('Error', error);
          return appActions.getConsentSectionFailure({ error });
        }
      })
    )
  );

  /* -------------------------------------------------------------------------- */
  /*                                    Form                                    */
  /* -------------------------------------------------------------------------- */
  getForm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.getForm),
      fetch({
        run: (action, state) => {
          return this.apiService
            .getFormById(action.formId)
            .pipe(map(form => appActions.getFormSuccess({ form })));
        },
        onError: (action, error) => {
          console.error('Error', error);
          return appActions.getFormFailure({ error });
        }
      })
    )
  );

  submitForm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(appActions.submitForm),
      withLatestFrom(this.store.select(appSelectors.selectState)),
      fetch({
        run: (action, state) => {
          // don't submit the request unless the form is valid
          if (!state.userDetailsValid) return appActions.hideLoading();

          return this.apiService
            .submitForm(state.form._id, { ...state.userDetails })
            .pipe(
              map(res =>
                appActions.submitFormSuccess({ form: { ...state.userDetails } })
              )
            );
        },
        onError: (action, error) => {
          console.error('Error', error);
          return appActions.submitFormFailure({ error });
        }
      })
    )
  );

  submitFormSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(appActions.submitFormSuccess),
        tap(data => {
          if (typeof window['onSubmitSuccess'] === 'function') {
            window['onSubmitSuccess'](data);
          } else {
            window.location.href = '/form-success';
          }
        })
      ),
    {
      dispatch: false
    }
  );

  submitFormFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(appActions.submitFormFailure),
        tap(({ error }) => {
          this.notification.error(
            'Oops',
            error.message || 'Failed to submit appointment'
          );
        })
      ),
    {
      dispatch: false
    }
  );
}
