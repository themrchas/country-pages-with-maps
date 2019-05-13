import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule,
  MatListModule,
  MatButtonModule,
  MatMenuModule,
  MatToolbarModule,
  MatGridListModule,
  MatTabsModule } from '@angular/material';
import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';

// List searching
import { MatFormFieldModule, MatInputModule } from '@angular/material';

// Modal support
import { MatDialogModule } from '@angular/material';

// Chart support
import { ChartsModule } from 'ng2-charts';

import { DashboardComponent } from './dashboard.component';
import { TileContainerComponent } from '../tiles/tile/tile-container.component';
import { UpcomingEventsComponent } from '../tiles/upcoming-events/upcoming-events.component';
import { TodayEventsComponent } from '../tiles/today-events/today-events.component';
import { NewsComponent } from '../tiles/news/news.component';
import { MapComponent } from '../tiles/map/map.component';
import { ChartComponent } from '../tiles/chart/chart.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TileDirective } from '../tiles/tile/tile.directive';
import { TableComponent } from '../tiles/table/table.component';
import { SingleItemComponent } from '../tiles/single-item/single-item.component';
import { LinksComponent } from '../tiles/links/links.component';
import { IframeModalComponent } from '../modals/iframe-modal/iframe-modal.component';
import { DetailsModalComponent } from '../modals/details-modal/details-modal.component';


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
    MapComponent,
    TableComponent,
    SingleItemComponent,
    LinksComponent,
    IframeModalComponent,
    DetailsModalComponent,
    ChartComponent
  ],
  imports: [
    CommonModule,
    MDBBootstrapModule.forRoot(),
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatGridListModule,
    MatToolbarModule,
    PerfectScrollbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatListModule,
    MatTabsModule,
    ChartsModule
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ],
  entryComponents: [
    TableComponent,
    MapComponent,
    NewsComponent,
    TableComponent,
    UpcomingEventsComponent,
    SingleItemComponent,
    LinksComponent,
    IframeModalComponent,
    DetailsModalComponent,
    ChartComponent
  ],
})
export class DashboardModule { }
