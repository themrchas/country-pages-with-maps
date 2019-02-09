import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { PromotedLinksComponent } from '../promoted-links/promoted-links.component';
import { UpcomingEventsComponent } from '../upcoming-events/upcoming-events.component';
import { TodayEventsComponent } from '../today-events/today-events.component';
import { NewsComponent } from '../news/news.component';
import { TableComponent } from '../table/table.component';
import { CountryFactBoxComponent } from '../country-fact-box/country-fact-box.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    DashboardComponent,
    PromotedLinksComponent,
    UpcomingEventsComponent,
    TodayEventsComponent,
    NewsComponent,
    TableComponent,
    CountryFactBoxComponent,
  ],
  imports: [
    CommonModule,
    PerfectScrollbarModule,
    DashboardRoutingModule
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ]
})
export class DashboardModule { }
