import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Country } from '../model/country';
import { TopicService } from '../services/topic.service';
import { ConfigProvider } from '../providers/configProvider';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  selectedCountry: Country;
  selectedTopic: Observable<any>;
  tableSettings: any;
  newsSettings: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService,
    private topicService: TopicService) { }

  ngOnInit() {
    this.countryService.selectedCountry.subscribe(selectedCountry => {
      this.selectedCountry = selectedCountry ;
    });

    this.topicService.selectedTopic.subscribe(selectedTopic => {
      this.selectedTopic = selectedTopic;
    });

  }

}
