import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Country } from '../model/country';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedCountry: Observable<Country>;
  constructor(private route: ActivatedRoute, private router: Router, private countryService: CountryService) { }

  ngOnInit() {
    this.countryService.selectedCountry.subscribe(selectedCountry => {
      this.selectedCountry = selectedCountry ;
    });
  }

}
