import { Component, OnInit, Input } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Country } from '../model/country';


@Component({
  selector: 'app-select-country',
  templateUrl: './select-country.component.html',
  styleUrls: ['./select-country.component.scss']
})
export class SelectCountryComponent implements OnInit {
  regions: Array<Array<Country>>;

  constructor(private countryService: CountryService) { }

  ngOnInit() {

    this.countryService.getRegions().subscribe(regions => this.regions = regions);
 }

}
