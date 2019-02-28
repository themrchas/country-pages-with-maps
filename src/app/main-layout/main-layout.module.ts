import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule } from '@angular/material';
import { MainLayoutComponent } from './main-layout.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { MainLayoutRoutingModule } from './main-layout-routing.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { NavComponent } from '../nav/nav.component';
import { SelectCountryComponent } from '../select-country/select-country.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    MainLayoutComponent,
    SelectCountryComponent,
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
    MDBBootstrapModule.forRoot()
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ]
})
export class MainLayoutModule { }
