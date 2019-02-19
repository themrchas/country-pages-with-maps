import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppLayoutComponent } from './app-layout.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SelectCountryComponent } from '../select-country/select-country.component';


const routes: Routes = [
  {
    path: 'country/:countryCode/:topic',
    component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent }
    ]
  },
  {
    path: 'country/:countryCode',
    component: AppLayoutComponent,
    children: [
      { path: '', component: DashboardComponent }
    ]
  },
  {
    path: 'country',
    component: AppLayoutComponent,
    children: [
      { path: '', component: SelectCountryComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLayoutRoutingModule { }
