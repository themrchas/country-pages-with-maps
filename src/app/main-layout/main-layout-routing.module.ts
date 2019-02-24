import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './main-layout.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SelectCountryComponent } from '../select-country/select-country.component';


const routes: Routes = [
  {
    path: 'country/:countryCode/:topicId',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardComponent }
    ]
  },
  {
    path: 'country/:countryCode',
    redirectTo: 'country/:countryCode/overview'
  },
  {
    path: 'country',
    component: MainLayoutComponent,
    /*children: [
      { path: '', component: SelectCountryComponent }
    ]*/
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }
