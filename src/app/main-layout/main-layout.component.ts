import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { TopicService } from '../services/topic.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ConfigProvider } from '../providers/configProvider';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService,
    private topicService: TopicService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.countryService.changeCountry(params.get('countryCode'));
    });
    this.route.queryParamMap.subscribe((queryParams: ParamMap) => {
      const topic = queryParams.get('topic');
      if (!topic) {
        this.router.navigate([], { queryParams: { topic: ConfigProvider.settings.topics[0].topicId }, replaceUrl: true});
      } else {
        this.topicService.changeTopic(topic);
      }
    });
  }

}
