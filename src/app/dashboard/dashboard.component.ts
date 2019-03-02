import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import {BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Country } from '../model/country';
import { TopicService } from '../services/topic.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedCountry: BehaviorSubject<Country>;
  selectedTopic: BehaviorSubject<any>;
  rows: Array<any>;
  tableSettings: any;
  newsSettings: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService,
    private topicService: TopicService) { }

  ngOnInit() {
    this.selectedCountry = this.countryService.selectedCountry;
    this.selectedTopic = this.topicService.selectedTopic;
    this.topicService.selectedTopic.subscribe(topic => {
      // Dynamically determine how many rows we need and which tiles per row
      // TODO: this happens every time the topic changes, maybe we should only
      // do this when the topic loads the first time, and keep them loaded?
      let currColCountForRow = 0;
      const tempRows = [[]];  // Each row will have an array of tiles
      for (const tile of topic.tiles) {
        if (currColCountForRow === 3 || tile.colspan + currColCountForRow > 3) {
          // Create new row
          tempRows.push([]);
          currColCountForRow = 0;
        }
        tempRows[tempRows.length - 1].push(tile);
        currColCountForRow += tile.colspan;
      }
      this.rows = tempRows;
    });

  }

}
