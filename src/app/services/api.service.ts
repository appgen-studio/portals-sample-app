import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  CreateAppointmentPublicDto,
  IAppointmentconsent,
  IAvailabilitySchedule,
  IBaseResponse,
  IForm,
  IService,
  PUBLIC_API,
  IAppointmentMeta,
  IAvailabilityQueue,
  IAppointment,
  ILead,
  AppointmentStatus
} from '@appgen-health-crm/api-interfaces';
import { catchError } from 'rxjs/operators';
import { PaymentMethod } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class APIService {
  BASE_URL = environment.publicApi.baseUrl;
  constructor(public http: HttpClient) {}

  ///////////////////////
  ///  index
  //////////////////////
  getAppointment(aptId: string, aptKey: string) {
    return this.http
      .get<{
        reservation: string;
        status: AppointmentStatus;
        service: IService;
        lead: ILead;
        extras: any;
        _id: string;
      }>(
        this.BASE_URL +
          PUBLIC_API.appointments.base +
          PUBLIC_API.appointments.single.replace(':id', aptId),
        {
          headers: {
            organization: window['organization'],
            'access-key': aptKey || ''
          }
        }
      )
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }

  cancelAppointment(aptId: string, aptKey: string) {
    return this.http
      .get<any>(
        this.BASE_URL +
          PUBLIC_API.appointments.base +
          PUBLIC_API.appointments.cancel.replace(':id', aptId),
        {
          headers: {
            organization: window['organization'],
            'access-key': aptKey || ''
          }
        }
      )
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }

  getServices() {
    return this.http
      .get<IService[]>(this.BASE_URL + PUBLIC_API.services.base, {
        headers: { organization: window['organization'] }
      })
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }

  getAvailability(serviceId, availableDays: number, timezone: string) {
    return this.http
      .get<IAvailabilitySchedule | IAvailabilityQueue>(
        `${
          this.BASE_URL + PUBLIC_API.services.base
        }${PUBLIC_API.services.singleServiceAvailability.replace(
          ':id',
          serviceId
        )}` + `?availableDays=${availableDays}&timezone=${timezone}`,
        {
          headers: { organization: window['organization'] } // TODO move to an interceptor and get brand from hostname
        }
      )
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }

  submitAppointment({
    serviceId,
    reservation,
    form,
    stripeToken,
    meta
  }: {
    serviceId: string;
    reservation: Date;
    form: any;
    stripeToken?: PaymentMethod;
    meta?: IAppointmentMeta;
  }): Observable<IAppointment> {
    const request: CreateAppointmentPublicDto = {
      serviceId,
      reservation: reservation.toISOString(),
      form: { ...form },
      stripeToken,
      meta
    };

    return this.http
      .post<IAppointment>(
        this.BASE_URL + PUBLIC_API.appointments.base,
        request,
        {
          headers: { organization: window['organization'] }
        }
      )
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }

  getFormById(id: string) {
    return this.http
      .get<IForm>(this.BASE_URL + PUBLIC_API.form.base + `/${id}`, {
        headers: { organization: window['organization'] }
      })
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }

  submitForm(formId: string, values: any) {
    return this.http
      .post<IBaseResponse>(
        this.BASE_URL + PUBLIC_API.form.base,
        { formId, values },
        {
          headers: { organization: window['organization'] }
        }
      )
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }

  getConsentSection() {
    return this.http
      .get<IAppointmentconsent>(
        this.BASE_URL +
          PUBLIC_API.services.base +
          PUBLIC_API.services.consentSection,
        {
          headers: { organization: window['organization'] }
        }
      )
      .pipe(
        catchError(error => {
          throw error.error || error;
        })
      );
  }
}
