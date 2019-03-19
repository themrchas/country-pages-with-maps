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
import { TableItemDialogComponent} from '../modals/table-item-dialog/table-item-dialog.component';

import { DashboardComponent } from './dashboard.component';
import { TileContainerComponent } from '../tiles/tile/tile-container.component';
import { UpcomingEventsComponent } from '../tiles/upcoming-events/upcoming-events.component';
import { TodayEventsComponent } from '../tiles/today-events/today-events.component';
import { NewsComponent } from '../tiles/news/news.component';
import { TableComponent } from '../tiles/table/table.component';
import { CountryFactBoxComponent } from '../tiles/country-fact-box/country-fact-box.component';
import { MapComponent } from '../tiles/map/map.component';
import { TabsComponent } from '../tiles/tabs/tabs.component';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TileDirective } from '../tiles/tile/tile.directive';
import { GenericTableComponent } from '../tiles/generic-table/generic-table.component';
import { SingleItemComponent } from '../tiles/single-item/single-item.component';
import { LinksComponent } from '../tiles/links/links.component';
import { IframeModalComponent } from '../modals/iframe-modal/iframe-modal.component';

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
    MapComponent,
    GenericTableComponent,
    TabsComponent,
    SingleItemComponent,
    TableItemDialogComponent,
    LinksComponent,
    IframeModalComponent
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
    PerfectScrollbarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatListModule,
    MatTabsModule
  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ],
  entryComponents: [
    TableComponent,
    MapComponent,
    NewsComponent,
    GenericTableComponent,
    CountryFactBoxComponent,
    TabsComponent,
    UpcomingEventsComponent,
    SingleItemComponent,
    LinksComponent,
    TableItemDialogComponent,
    IframeModalComponent
  ],
})
export class DashboardModule { }
