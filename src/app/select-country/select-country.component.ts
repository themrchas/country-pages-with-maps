import { Component, OnInit, Input } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Country } from '../model/country';
import * as _ from 'lodash';

@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.component.html',
  styleUrls: ['./select-country.component.scss']
})
export class SelectCountryComponent implements OnInit {
  regions: Array<Array<Country>>;
  countriesEA: Array<Country>;
  countriesNWA: Array<Country>;

  constructor(private countryService: CountryService) { }

  ngOnInit() {

    this.countryService.getCountries().subscribe({
      next: obsCountries =>  {
          this.regions = _.groupBy(obsCountries, 'region');
        }
    });
 }

}
