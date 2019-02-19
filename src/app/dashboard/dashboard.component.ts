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
  tableSettings: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService) { }

  ngOnInit() {
    this.countryService.selectedCountry.subscribe(selectedCountry => {
      this.selectedCountry = selectedCountry ;
    });

    this.route.paramMap.subscribe((params: ParamMap) => console.log('Topic: ' + params.get('topic')));

    this.tableSettings = {
      source: {
        webURL: 'http://localhost:8080/sites/SOCAFDEV',
        listName: 'SampleList'
      },
      columns: [
        { columnName: 'Title', displayName: 'Title' },
        { columnName: 'Created', displayName: 'Created Date'}
      ]
    };
  }

}
