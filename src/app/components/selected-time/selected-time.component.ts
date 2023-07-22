import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppFacade } from '../../+store/+app/app.facade';

@Component({
  selector: 'selected-time',
  templateUrl: './selected-time.component.html',
  styleUrls: ['./selected-time.component.less']
})
export class SelectedTimeComponent implements OnInit {
  time$ = this.facade.selectedTime$;
  date$ = this.facade.selectedDate$;

  displayTime;
  constructor(private facade: AppFacade) {}

  ngOnInit(): void {
    this.facade.selectedTime$.subscribe(time => {
      const hours = Math.floor(parseInt(time) / 60);
      const minutes = parseInt(time) % 60;
      this.displayTime =
        (hours > 12 ? hours - 12 : hours) +
        ':' +
        (minutes < 10 ? '0' + minutes : minutes) +
        (hours > 11 ? ' PM' : ' AM');
    });
  }

  confirm() {
    this.facade.resetTime();
  }

  cancel() {}
}
