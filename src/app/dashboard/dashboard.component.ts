import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { BehaviorSubject} from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Country } from '../model/country';
import { TopicService } from '../services/topic.service';
import { combineLatest } from 'rxjs';

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
    console.log(' --> calling ngOnInit in dashboard.component.ts');
    this.selectedCountry = this.countryService.selectedCountry;
    console.log(' --> this.selectedCountry in dashboard.components.ts ngOnInit is',this.selectedCountry);

    this.selectedTopic = this.topicService.selectedTopic;

    console.log(' --> this.selectedTopic in dashboard.components.ts ngOnInit is',this.selectedTopic);

    combineLatest(this.selectedCountry, this.selectedTopic).subscribe(combined => {
      const country = combined[0];
      const topic = combined[1];

      if (country && topic) {
        let currColCountForRow = 0;
        const tempRows = [[]];  // Each row will have an array of tiles, tiles can span 1-3 cols
        for (const item of topic.tiles) {
          const tile = Object.assign({}, item);
          // countries can have customized tiles
          if (this.displayTileForCountry(tile, country)) {
            if (currColCountForRow === 3 || tile.colspan + currColCountForRow > 3) {
              // Create new row
              tempRows.push([]);
              currColCountForRow = 0;
            }
            // Countries can have customized sources per tile
            if (tile.customSettings && tile.customSettings[country.countryCode3]) {
              tile.settings = tile.customSettings[country.countryCode3];
            }
            tempRows[tempRows.length - 1].push(tile);
            currColCountForRow += tile.colspan;
          }
        }
        this.rows = tempRows;
      }
    });
  }

  displayTileForCountry(tile, country: Country): boolean {
    let retVal = true;
    if (tile.displayForCountries && country) {
      retVal = tile.displayForCountries.includes(country.countryCode3);
    }
    return retVal;
  }

}
