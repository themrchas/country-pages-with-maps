import { Component, OnInit, AfterViewChecked } from '@angular/core';
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
export class DashboardComponent implements OnInit, AfterViewChecked {
  selectedCountry: Country;
  selectedTopic: any;
  tiles: Array<any>;
  tableSettings: any;
  newsSettings: any;
  highlightedTileId: any;
  grid: any;
  displayGrid = false;
  gridChanged = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private countryService: CountryService,
    private topicService: TopicService) { }

    ngOnInit() {

      combineLatest(this.countryService.selectedCountry, this.topicService.selectedTopic).subscribe(combined => {
        this.selectedCountry = combined[0];
        this.selectedTopic = combined[1];

        if (this.selectedCountry && this.selectedTopic) {
          this.highlightedTileId = null;
          this.clearGrid();

          if (this.selectedCountry && this.selectedTopic) {
            const tempTiles = [];
            for (const item of this.selectedTopic.tiles) {
              const tile = Object.assign({ tileId: item.type + '_' + item.x + '_' + item.y }, item);
              // countries can have customized tiles
              if (this.countryService.displayTileForCountry(tile, this.selectedCountry)) {
                // Regions can have customized sources per tile
                if (tile.customSettings && tile.customSettings[this.selectedCountry.region]) {
                  tile.settings = tile.customSettings[this.selectedCountry.region];
                }
                // Countries can have customized sources per tile
                if (tile.customSettings && tile.customSettings[this.selectedCountry.countryCode3]) {
                  tile.settings = tile.customSettings[this.selectedCountry.countryCode3];
                }
                tempTiles.push(tile);
              }
            }
            this.tiles = tempTiles;
            this.displayGrid = true;
            this.gridChanged = true;
          }
        }
      });

      this.topicService.highlightedTile.subscribe(tileId => {
        if (tileId !== null) {
          const el = document.getElementById(tileId);
          el.scrollIntoView({ behavior: 'smooth', inline: 'start' });
          this.highlightedTileId = tileId;
        }
      });
    }

    // We need this to run after Angular has finished updating the html based on grid changing
    ngAfterViewChecked() {
      if (this.gridChanged === true) {
        this.gridChanged = false;

        $('.grid-stack').gridstack({
            cellHeight: 80,
            verticalMargin: 10,
            disableResize: true,
            disableDrag: true,
            width: 3
        });
        this.grid = $('.grid-stack').data('gridstack');
      }
    }

    clearGrid() {
        // We want the grid to completely re-render, removing all the gridstack events and DOM updates.
        // This involves:
        // 1.  Removing all the tiles, otherwise gridstack sets the wrong y-value on future tiles
        // 2.  Destroying the gridstack instance, but keep the gridstack DOM element
        // 3.  Set displayGrid to false.  Due to *ngIf=displayGrid in the template, the gridstack element
        // will be removed from the DOM, but our underlying Angular template is still present.
        if (this.grid) {
          this.grid.removeAll();
          this.grid.destroy(false);
          this.displayGrid = false;
        }
    }
}
