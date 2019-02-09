import { Component, OnInit, HostListener } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { CountryService } from '../services/country.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  navConfig: any;
  leftMenus: Array<any>;
  navbarCollapsed: boolean;
  env: string;
  countries: Array<any>;

  constructor(private countryService: CountryService) { }

  ngOnInit() {
    this.navConfig = ConfigProvider.settings.navMenuConfig;

    // Using the selector, find the html for the dropdown
    // TODO: Remove this and dynamically generate these (see next TODO)
    this.leftMenus = this.navConfig.leftMenus;

    // TODO: retrieve countries from the list, gpossibly grouped by Region?
    // Not sure is the REST API supports grouping, especially if the Region column is a Managed Metadata column
    this.countryService.getCountries().subscribe({
      next: response => {
        if (response && response['d']) {
          this.countries = response['d'].results;
        }
      }
    });

    this.adjustNavbarMenus();

    this.env = ConfigProvider.env;
  }

  // change the navbar menus to be clickable when navbar collapsed, otherwise hoverable
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.adjustNavbarMenus();
  }

  adjustNavbarMenus() {
    if ($(window).width() > 768) {
      this.navbarCollapsed = false;
      $('.dropdown').removeClass('open');
    } else {
      this.navbarCollapsed = true;
    }
  }
}
