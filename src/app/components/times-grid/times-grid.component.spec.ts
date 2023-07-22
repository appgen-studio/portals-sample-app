import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesGridComponent } from './times-grid.component';

describe('TimesGridComponent', () => {
  let component: TimesGridComponent;
  let fixture: ComponentFixture<TimesGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
