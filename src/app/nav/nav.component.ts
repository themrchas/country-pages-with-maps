import { Component, OnInit, HostListener } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Country } from '../model/country';
import { TopicService } from '../services/topic.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  selectedCountry: Country;
  topics: Array<any>;

  constructor(private countryService: CountryService, private topicService: TopicService) { }

  ngOnInit() {

    this.countryService.selectedCountry.subscribe(selectedCountry => this.selectedCountry = selectedCountry);
    this.topics = this.topicService.getTopics();
  }
}
