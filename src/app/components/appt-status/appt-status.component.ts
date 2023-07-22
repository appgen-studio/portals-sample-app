import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { AppFacade } from '../../+store/+app/app.facade';

@Component({
  selector: 'appt-status',
  templateUrl: './appt-status.component.html',
  styleUrls: ['./appt-status.component.less']
})
export class AppointmentStatusComponent implements OnInit, OnDestroy {
  active = true;
  appointment: any;
  constructor(private facade: AppFacade) {}

  ngOnInit(): void {
    this.facade.appointmentDetails$
      .pipe(takeWhile(() => this.active))
      .subscribe(appointment => {
        console.log('appointment', appointment);

        this.appointment = appointment;
      });
  }

  ngOnDestroy(): void {
    this.active = false;
  }

  rescheduleAppointment() {
    this.facade.rescheduleAppointment();
  }

  cancelAppointment() {
    this.facade.cancelAppointment();
  }
}
