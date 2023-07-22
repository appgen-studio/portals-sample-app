import { BrowserModule } from '@angular/platform-browser';
import { ApplicationRef, DoBootstrap, Injector, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers, effects } from './+store/app.states';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';

import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { IconsModule } from './icons/icons.module';
import { ServicesGridComponent } from './components/services-grid/services-grid.component';
import { TimeItemComponent } from './components/time-item/time-item.component';
import { TimesGridComponent } from './components/times-grid/times-grid.component';
import { environment } from '../environments/environment';
import { DetailsFormComponent } from './components/details-form/details-form.component';
import { DateItemComponent } from './components/date-item/date-item.component';
import { DatesGridComponent } from './components/dates-grid/dates-grid.component';
import { SelectedTimeComponent } from './components/selected-time/selected-time.component';
import { DateInputModule, OntarioHcModule } from '@appgen-health-crm/ui';
import { NgxImageCompressService } from 'ngx-image-compress';
import { createCustomElement } from '@angular/elements';
import { SafePipe } from './pipes/safe.pipe';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FormV1Module } from '@appgen-health-crm/ui';
import { NgxStripeModule } from 'ngx-stripe';
import { PaymentComponent } from './components/payment/payment.component';
import { AppointmentStatusComponent } from './components/appt-status/appt-status.component';
// registerLocaleData(localeFr);
registerLocaleData(en);
// AoT requires an exported function for factories
// export function createTranslateLoader(http: HttpClient) {
//   return new TranslateHttpLoader(
//     http,
//     environment.assetsURI + '/assets/i18n/',
//     '.json'
//   );
// }

const ngZorroConfig: NzConfig = {
  notification: { nzPlacement: 'topRight' }
};

const providers = [];
providers.push({ provide: NZ_I18N, useValue: en_US });
providers.push({ provide: NZ_CONFIG, useValue: ngZorroConfig });
providers.push(NgxImageCompressService);
if (window['base-href']) {
  // needed for backward compatibility
  providers.push({
    provide: APP_BASE_HREF,
    useValue: window['base-href']
  });
}
@NgModule({
  declarations: [
    AppComponent,
    ServicesGridComponent,
    TimeItemComponent,
    TimesGridComponent,
    DetailsFormComponent,
    DateItemComponent,
    DatesGridComponent,
    SelectedTimeComponent,
    PaymentComponent,
    AppointmentStatusComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: 'enabledBlocking' }),
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzAlertModule,
    NzCheckboxModule,
    NzRadioModule,
    NzToolTipModule,
    NgxStripeModule.forRoot(environment.stripe.publicKey),
    StoreModule.forRoot(reducers, {
      metaReducers: !environment.production ? [] : [],
      runtimeChecks: {
        strictActionImmutability: true,
        strictStateImmutability: true
      }
    }),
    EffectsModule.forRoot(effects),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production // Restrict extension to log-only mode
    }),
    IconsModule,

    // ng ant
    NzLayoutModule,
    NzGridModule,
    NzDatePickerModule,
    NzNotificationModule,
    NzEmptyModule,
    NzDividerModule,
    DateInputModule,
    FormV1Module,
    OntarioHcModule,
    NgxFileDropModule
    // TranslateModule.forRoot({
    //   loader: {
    //     provide: TranslateLoader,
    //     useFactory: createTranslateLoader,
    //     deps: [HttpClient]
    //   }
    // })
  ],
  providers
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {}
  ngDoBootstrap(appRef: ApplicationRef): void {
    if (environment.production) {
      const customElement = createCustomElement(AppComponent, {
        injector: this.injector
      });
      customElements.define('appgen-booking-app', customElement);
    } else {
      if (!window['organization']) {
        window['organization'] = 'appgen_demo';
      }
      console.log('window set>>', window['organization']);
      appRef.bootstrap(AppComponent);
    }
  }
}
