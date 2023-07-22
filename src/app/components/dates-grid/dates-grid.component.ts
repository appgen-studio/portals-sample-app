import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { takeWhile, tap } from 'rxjs/operators';
import { AppFacade } from '../../+store/+app/app.facade';

@Component({
  selector: 'dates-grid',
  templateUrl: './dates-grid.component.html',
  styleUrls: ['./dates-grid.component.less']
})
export class DatesGridComponent implements OnInit, OnDestroy {
  active = true;
  dates: string[] = [];
  selectedDate: string;

  constructor(private facade: AppFacade) {

  }

  ngOnInit() {
    this.facade.selectedDate$
      .pipe(takeWhile(() => this.active))
      .subscribe(date => {
        this.selectedDate = date;
      });

    this.facade.availableDates$
      .pipe(takeWhile(() => this.active))
      .subscribe(dates => {
        this.dates = dates;
      });
  }

  ngOnDestroy() {
    this.active = false;
  }

  selectDate(date: string) {
    this.facade.selectDate(date);
  }

  addDays(date: Date, days: number) {
    if (!days) return date;
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  isEqualToSelectedDate(date: string): boolean {
    if (!this.selectedDate) return false;
    return this.selectedDate === date;
  }
}
