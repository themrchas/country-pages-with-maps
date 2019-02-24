import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { TopicService } from '../services/topic.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService,
    private topicService: TopicService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.countryService.changeCountry(params.get('countryCode'));
      this.topicService.changeTopic(params.get('topicId'));
    });
  }

}
