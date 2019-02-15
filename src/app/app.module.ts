import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ConfigProvider, configProviderFactory } from './providers/configProvider';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { PromotedLinksComponent } from './promoted-links/promoted-links.component';
import { UpcomingEventsComponent } from './upcoming-events/upcoming-events.component';
import { TodayEventsComponent } from './today-events/today-events.component';
import { NewsComponent } from './news/news.component';
import { TableComponent } from './table/table.component';
import { CountryFactBoxComponent } from './country-fact-box/country-fact-box.component';
import { AppLayoutModule } from './app-layout/app-layout.module';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};



const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/selectCountry' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    AppLayoutModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    HttpClientModule,
    PerfectScrollbarModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    PromotedLinksComponent,
    UpcomingEventsComponent,
    TodayEventsComponent,
    NewsComponent,
    TableComponent,
    CountryFactBoxComponent
  ],
  providers: [
    ConfigProvider,
    { provide: APP_INITIALIZER, useFactory: configProviderFactory, deps: [ConfigProvider], multi: true},
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
