import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule, MatToolbarModule, MatListModule,
  MatIconModule, MatButtonModule, MatMenuModule, MatTabsModule } from '@angular/material';
import { MainLayoutComponent } from './main-layout.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MainLayoutRoutingModule } from './main-layout-routing.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { SplashPageComponent } from '../splash-page/splash-page.component';

import { NavComponent } from '../nav/nav.component';
import { SelectCountryComponent } from '../select-country/select-country.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    MainLayoutComponent,
    SelectCountryComponent,
    SplashPageComponent,
    NavComponent
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    MainLayoutRoutingModule,
    DashboardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTabsModule,
    MDBBootstrapModule.forRoot()
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ]
})
export class MainLayoutModule { }
