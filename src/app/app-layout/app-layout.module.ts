import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule,
  MatMenuModule, MatButton } from '@angular/material';
import { AppLayoutComponent } from './app-layout.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppLayoutRoutingModule } from './app-layout-routing.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { SelectCountryComponent } from '../select-country/select-country.component';
import { NavComponent } from '../nav/nav.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppLayoutComponent,
    SelectCountryComponent,
    NavComponent
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    AppLayoutRoutingModule,
    DashboardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ]
})
export class AppLayoutModule { }
