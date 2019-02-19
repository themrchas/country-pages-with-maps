import { Component, OnInit, HostListener } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { CountryService } from '../services/country.service';
import { Country } from '../model/country';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  selectedCountry: Observable<Country>;
  countries: Observable<Array<Country>>;

  constructor(private countryService: CountryService) { }

  ngOnInit() {

    this.countryService.selectedCountry.subscribe(selectedCountry => {
      this.selectedCountry = selectedCountry ;
    });

    // TODO: retrieve countries from the list, possibly grouped by Region?
    // Not sure is the REST API supports grouping, especially if the Region column is a Managed Metadata column
    this.countries = this.countryService.getCountries();
  }
}
