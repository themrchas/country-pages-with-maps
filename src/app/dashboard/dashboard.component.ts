import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedCountry: Observable<any>;
  constructor(private route: ActivatedRoute, private router: Router, private countryService: CountryService) { }

  ngOnInit() {
    this.selectedCountry = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.countryService.getCountry(params.get('countryCode')))
    );

  }

}
