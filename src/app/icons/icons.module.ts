import { NgModule } from '@angular/core';
import { IconDefinition } from '@ant-design/icons-angular';

import { NzIconModule } from 'ng-zorro-antd/icon';

// Import what you need. RECOMMENDED. ✔️
import {
  CheckOutline,
  InfoCircleFill,
  ClockCircleFill,
  DeleteOutline,
  InboxOutline,
  PaperClipOutline,
  RestOutline,
  ReloadOutline,
  LockOutline,
  PlusOutline,
  RedoOutline
} from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [
  CheckOutline,
  InfoCircleFill,
  ClockCircleFill,
  DeleteOutline,
  InboxOutline,
  PaperClipOutline,
  RestOutline,
  ReloadOutline,
  LockOutline,
  PlusOutline,
  RedoOutline
];

@NgModule({
  imports: [NzIconModule.forRoot(icons)],
  exports: [NzIconModule]
})
export class IconsModule {}
