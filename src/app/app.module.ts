import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ConfigProvider, configProviderFactory } from './providers/configProvider';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { MainLayoutModule } from './main-layout/main-layout.module';

const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/country' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    MainLayoutModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  providers: [
    ConfigProvider,
    { provide: APP_INITIALIZER, useFactory: configProviderFactory, deps: [ConfigProvider], multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
