import { Component, OnInit, Input } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Observable, of } from 'rxjs';
import { Country } from '../model/country';

@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.component.html',
  styleUrls: ['./select-country.component.scss']
})
export class SelectCountryComponent implements OnInit {
  countriesEA: Array<Country>;
  countriesNWA: Array<Country>;


  // Return array of countries based on region
  private groupCountries(countries: Country[], region: string): Array<Country> {
    return countries.filter(el => el.region === region);
  }

  constructor(private countryService: CountryService) { }

  ngOnInit() {

    this.countryService.getCountries().subscribe({
      next: obsCountries =>  {
          this.countriesEA = this.groupCountries(obsCountries, 'EA');
          this.countriesNWA = this.groupCountries(obsCountries, 'NWA');
        }
    });
 }

}
