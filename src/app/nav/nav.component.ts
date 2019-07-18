import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Country } from '../model/country';
import { TopicService } from '../services/topic.service';
import { Observable } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';
import { combineLatest } from 'rxjs';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-nav',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          // style({transform: 'translateY(-100%)', opacity: 0}),
          // animate('500ms', style({transform: 'translateY(0)', opacity: 1}))
          /* style({height: 0, overflow: 'hidden' }),
          animate('400ms 2000ms', style({ height: '*'})) */
          style({transform: 'translateY(-100%)', height: 0}),
          animate('200ms ease-in', style({transform: 'translateY(0%)', height: '*'}))
        ])/*,
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateY(100%)', opacity: 0}))
        ])*/
      ]
    )
  ],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  selectedCountry: Observable<Country>;
  selectedTopic: Observable<any>;
  topics: Array<any>;
  tilesForTopic: Array<any>;
  feedbackUrl: string;
  flagHidden: boolean;
  @ViewChild('sideNav') sideNav: any;

  constructor(private countryService: CountryService, private topicService: TopicService) { }

  ngOnInit() {
    this.flagHidden = false;
    this.feedbackUrl = ConfigProvider.settings.feedbackUrl + '?source=' + window.location.href;
    this.selectedCountry = this.countryService.selectedCountry;
    this.selectedTopic = this.topicService.selectedTopic;
    this.topics = this.topicService.getTopics();
    combineLatest(this.countryService.selectedCountry, this.topicService.selectedTopic).subscribe(combined => {
      this.scrollTop();
      const country = combined[0];
      const topic = combined[1];
      this.tilesForTopic = topic.tiles.filter(tile => this.countryService.displayTileForCountry(tile, country));
    });
  }

  highlightTile(tileId) {
    this.topicService.highlightTile(tileId);
  }

  scrollTop() {
    this.sideNav.elementRef.nativeElement.scrollTop = 0;
  }
}
