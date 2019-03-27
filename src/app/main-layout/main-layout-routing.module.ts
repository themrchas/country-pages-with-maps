import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SplashPageComponent } from '../splash-page/splash-page.component';


const routes: Routes = [
  {
    path: 'country/:countryCode',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardComponent }
    ]
  },
  {
    path: 'country',
    component: MainLayoutComponent,
    children: [
      { path: '', component: SplashPageComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }
