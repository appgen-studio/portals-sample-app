import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { AppFacade } from '../../+store/+app/app.facade';
import { IAvailabilitySlot } from '@care-portals/api-interfaces';

@Component({
  selector: 'times-grid',
  templateUrl: './times-grid.component.html',
  styleUrls: ['./times-grid.component.less']
})
export class TimesGridComponent implements OnInit, OnDestroy {
  slots: string[];
  availability: IAvailabilitySlot[];
  selectedTime: string;
  selectedDate: number;
  minLeadTime: number;
  maxLeadTime: number;
  active = true;

  constructor(private facade: AppFacade) {}

  ngOnInit() {
    this.facade.availableTimes$
      .pipe(takeWhile(() => this.active))
      .subscribe(availability => {
        this.availability = availability;
        this.slots = this.availability ? Object.keys(this.availability) : [];
      });

    this.facade.selectedService$
      .pipe(takeWhile(() => this.active))
      .subscribe(service => {
        this.minLeadTime = service.minLeadTime;
        this.maxLeadTime = service.maxLeadTime;
      });

    this.facade.selectedTime$
      .pipe(takeWhile(() => this.active))
      .subscribe(time => {
        this.selectedTime = time;
      });

    this.facade.selectedDate$
      .pipe(takeWhile(() => this.active))
      .subscribe(date => {
        this.selectedDate = new Date(date).setHours(0, 0, 0, 0);
      });
  }

  ngOnDestroy() {
    this.active = false;
  }

  selectTime(time: string) {
    this.facade.selectTime(time);
  }

  get timezone() {
    // TODO get the time zone from the org config
    if (window['organization'] === 'flamingo_pharmacy') {
      return 'Local Time (Providenciales, Turks and Caicos)';
    } else {
      const today = new Date();
      const short = today.toLocaleDateString(undefined);
      const full = today.toLocaleDateString(undefined, {
        timeZoneName: 'short'
      });

      // Trying to remove date from the string in a locale-agnostic way
      const shortIndex = full.indexOf(short);
      if (shortIndex >= 0) {
        const trimmed =
          full.substring(0, shortIndex) +
          full.substring(shortIndex + short.length);

        // by this time `trimmed` should be the timezone's name with some punctuation -
        // trim it from both sides
        return trimmed.replace(/^[\s,.\-:;]+|[\s,.\-:;]+$/g, '');
      } else {
        // in some magic case when short representation of date is not present in the long one, just return the long one as a fallback, since it should contain the timezone's name
        return full;
      }
    }
  }
}
