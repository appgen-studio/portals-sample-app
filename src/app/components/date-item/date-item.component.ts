import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'date-item',
  templateUrl: './date-item.component.html',
  styleUrls: ['./date-item.component.less']
})
export class DateItemComponent {
  @Input() date: Date;
  @Input() selected = false;

  @Output() setSelected = new EventEmitter<Date>();

  select() {
    this.setSelected.emit(this.date);
  }
}
