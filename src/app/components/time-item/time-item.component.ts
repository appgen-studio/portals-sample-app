import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'time-item',
  templateUrl: './time-item.component.html',
  styleUrls: ['./time-item.component.less']
})
export class TimeItemComponent implements OnInit {
  @Input() time: string;
  @Input() selected = false;
  @Input() count: number;
  @Input() selectedDate: number;

  /** time in minuets to allow the lead to book from now
   *  if 30 minutes then the lead can only book slots 30 minutes from now
   */
  @Input() minLeadTime: number;

  /** time in minuets to not allow the lead to book after, from now
   *  if 30 minutes then the lead can only book slots before 30 minutes from now
   */
  @Input() maxLeadTime: number;

  @Output() setSelected = new EventEmitter<string>();

  displayTime: string;

  constructor() {}

  ngOnInit() {
    const hours = Math.floor(parseInt(this.time) / 60);
    const minutes = parseInt(this.time) % 60;
    this.displayTime =
      (hours > 12 ? hours - 12 : hours) +
      ':' +
      (minutes < 10 ? '0' + minutes : minutes) +
      (hours > 11 ? ' PM' : ' AM');
  }
  select() {
    this.setSelected.emit(this.time);
  }
}
