import { Component, OnInit, Input } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Country } from '../model/country';
import * as _ from 'lodash';
import { MatTabChangeEvent } from '@angular/material';


@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.component.html',
  styleUrls: ['./select-country.component.scss']
})
export class SelectCountryComponent implements OnInit {
  regions: any;  // countries grouped by region
  campaigns: any; // countries grouped by campaign
  countries: Array<Country>; // flat countries array
  tabChanged = false;

  constructor(private countryService: CountryService) { }

  ngOnInit() {

    this.countryService.getCountries().subscribe(countries => {
      this.countries = countries;
      this.regions = _.groupBy(this.countries, 'region');

      // Group by Campaigns.  For countries that have multiple campaigns, add them once per group
      const campObj = {};
      this.countries.forEach(country => {
        if (country.campaigns) {
          country.campaigns.forEach(campaign => {
            if (!campObj[campaign]) {
              campObj[campaign] = [country];
            } else {
              campObj[campaign].push(country);
            }
          });
        }
      });
      this.campaigns = campObj;
    });
 }

 handleClick(e) {
    if (!e.target.classList.contains('dropdown-item')) {
      event.stopPropagation();
    }
  }

  // For some reason the inkbar does not display initially on the drop down for the tab headings
  // until a tab is selected. To fix this, initially set the inkbar position and once the tab is changed,
  // remove the class
  onTabChanged(event: MatTabChangeEvent) {
    this.tabChanged = true;
  }

}
