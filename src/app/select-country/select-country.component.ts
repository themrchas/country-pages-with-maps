import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Observable, of } from 'rxjs';
import { Country } from '../model/country';

@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.component.html',
  styleUrls: ['./select-country.component.css']
})
export class SelectCountryComponent implements OnInit {

  selectedCountry: Observable<Country>;
 // countries: Observable<Array<Country>>;

  countriesEA: Observable<Array<Country>>;
  countriesNWA: Observable<Array<Country>>;


  //Return array of countries based on region
  private groupCountries(countries: Country[], region: string): Observable<Array<Country>> {

    return of(countries.filter(el => el.region == region)); 
}


  constructor(private countryService: CountryService) { }

  ngOnInit() {
    this.countryService.selectedCountry.subscribe(selectedCountry => {
      this.selectedCountry = selectedCountry ;
    });

    //this.countries = this.countryService.getCountries();

    this.countryService.getCountries().subscribe({
      next: obsCountries =>  { console.log('observable returned', obsCountries); 
                           
                           this.countriesEA = this.groupCountries(obsCountries,'EA');
                           this.countriesNWA = this.groupCountries(obsCountries,'NWA');
                          }
                             
    });
 }

}
