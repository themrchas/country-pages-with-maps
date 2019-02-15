import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Observable, of } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Country } from '../model/country';
import { map, switchMap, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css']
})
export class AppLayoutComponent implements OnInit {
  // selectedCountry: Observable<Country>;
  constructor(private route: ActivatedRoute, private router: Router, private countryService: CountryService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => this.countryService.changeCountry(params.get('countryCode')));
  }

}
