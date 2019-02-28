import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule, MatListModule, MatButtonModule, MatMenuModule, MatToolbarModule, MatGridListModule } from '@angular/material';
import { DashboardComponent } from './dashboard.component';
import { TileContainerComponent } from '../tiles/tile/tile-container.component';
import { UpcomingEventsComponent } from '../tiles/upcoming-events/upcoming-events.component';
import { TodayEventsComponent } from '../tiles/today-events/today-events.component';
import { NewsComponent } from '../tiles/news/news.component';
import { TableComponent } from '../tiles/table/table.component';
import { CountryFactBoxComponent } from '../tiles/country-fact-box/country-fact-box.component';
import { MapComponent } from '../tiles/map/map.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TileDirective } from '../tiles/tile/tile.directive';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    DashboardComponent,
    TileDirective,
    TileContainerComponent,
    UpcomingEventsComponent,
    TodayEventsComponent,
    NewsComponent,
    TableComponent,
    CountryFactBoxComponent,
    MapComponent
  ],
  imports: [
    DashboardRoutingModule,
    CommonModule,
    MDBBootstrapModule.forRoot(),
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatGridListModule,
    MatToolbarModule,
    PerfectScrollbarModule
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ],
  entryComponents: [TableComponent, MapComponent, NewsComponent],
})
export class DashboardModule { }
