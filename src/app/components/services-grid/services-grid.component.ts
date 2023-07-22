import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IService } from '@appgen-health-crm/api-interfaces';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppFacade } from '../../+store/+app/app.facade';

@Component({
  selector: 'services-grid',
  templateUrl: './services-grid.component.html',
  styleUrls: ['./services-grid.component.less']
})
export class ServicesGridComponent implements OnInit {
  services = {
    available: []
  };
  selectedService: IService;

  constructor(private facade: AppFacade) {}

  ngOnInit(): void {
    this.facade.availableServices$.subscribe(
      services => (this.services.available = services || [])
    );

    this.facade.selectedService$.subscribe(
      service => (this.selectedService = service)
    );
  }

  public toggleService(service: IService) {
    this.facade.toggleService(service._id);
  }

  cancel() {}
}
