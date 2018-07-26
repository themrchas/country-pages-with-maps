import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SplashComponent } from './splash/splash.component';
import { PromotedLinksComponent } from './promoted-links/promoted-links.component';
import { SearchComponent } from './search/search.component';
import { APP_INITIALIZER } from '@angular/core';
import { UpcomingEventsComponent } from './upcoming-events/upcoming-events.component';
import { HttpClientModule } from '@angular/common/http';
import { TodayEventsComponent } from './today-events/today-events.component';
import { ConfigProvider, configProviderFactory } from './providers/configProvider';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NewsComponent } from './news/news.component';
import { NavComponent } from './nav/nav.component';
import { FeedbackComponent } from './feedback/feedback.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    PromotedLinksComponent,
    SearchComponent,
    UpcomingEventsComponent,
    TodayEventsComponent,
    NewsComponent,
    NavComponent,
    FeedbackComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    PerfectScrollbarModule
  ],
  providers: [
    ConfigProvider,
    { provide: APP_INITIALIZER, useFactory: configProviderFactory, deps: [ConfigProvider], multi: true},
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
