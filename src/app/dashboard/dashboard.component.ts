import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Country } from '../model/country';
import { TopicService } from '../services/topic.service';
import { ConfigProvider } from '../providers/configProvider';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedCountry: BehaviorSubject<Country>;
  selectedTopic: BehaviorSubject<any>;
  tableSettings: any;
  newsSettings: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService,
    private topicService: TopicService) { }

  ngOnInit() {
    this.selectedCountry = this.countryService.selectedCountry;
    this.selectedTopic = this.topicService.selectedTopic;

  }

}
