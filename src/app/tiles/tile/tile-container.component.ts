import { Component, OnInit, Input, ComponentFactoryResolver, ViewChild, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { TileDirective } from './tile.directive';
import { TileComponent } from './tile.component';

import { Country } from '../../model/country';
import { BehaviorSubject } from 'rxjs';
import { NewsComponent } from '../news/news.component';
import { MapComponent } from '../map/map.component';
import { TableComponent } from '../table/table.component';
import { UpcomingEventsComponent } from '../upcoming-events/upcoming-events.component';
import { SingleItemComponent } from '../single-item/single-item.component';
import { LinksComponent } from '../links/links.component';
import { ChartComponent } from '../chart/chart.component';

@Component({
  selector: 'app-tile',
  templateUrl: './tile-container.component.html',
  styleUrls: ['./tile-container.component.css']
})
export class TileContainerComponent implements OnInit, AfterViewInit {
  @Input() tile: any;
  @Input() country: Country;
  @ViewChildren(TileDirective) tileDirectives: QueryList<TileDirective>;
  sources: Array<any>;
  showTabs: boolean;
  tileTypes = {
    TABLE: 'table',
    NEWS: 'news',
    MAP: 'map',
    TABS: 'tabs',
    UPCOMING_EVENTS: 'upcoming-events',
    SINGLE_ITEM: 'single-item',
    LINKS: 'links',
    CHART: 'chart'
  };

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.showTabs = this.tile.type === this.tileTypes.TABS;
  }

  getSourcesForTile(tile) {
    let sources: any;
    if (tile.settings) {
      if (tile.settings.source) {
        sources = [tile.settings.source];
      } else {
        sources = tile.settings.sources;
      }
    }
    return sources;
  }

  ngAfterViewInit() {
    // This is to prevent the 'expression has changed after it was checked' error message
    // Defer the code inside ngAfterViewInit to another Javascript turn
    setTimeout(() => {
      const tileSources = Array<any>();
      this.tileDirectives.forEach((currentDirective, index) => {
        const currentTile = !this.showTabs ? this.tile : this.tile.settings.tabs[index];

        const tileComponent = this.getTileComponent(currentTile.type);
        const tileSettings = currentTile.settings;
        tileSources.push(...this.getSourcesForTile(currentTile));

        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
          tileComponent);

        const viewContainerRef = currentDirective.viewContainerRef;
        viewContainerRef.clear();

        const componentRef = viewContainerRef.createComponent(componentFactory);
        (componentRef.instance as TileComponent).settings = tileSettings;
        (componentRef.instance as TileComponent).country = this.country;
      });
      this.sources = tileSources;
    });
  }

  getTileComponent(tileType) {
    let tileComponent;
    switch (tileType) {
      case this.tileTypes.TABLE: {
        tileComponent = TableComponent;
        break;
      }
      case this.tileTypes.NEWS: {
        tileComponent = NewsComponent;
        break;
      }
      case this.tileTypes.MAP: {
        tileComponent = MapComponent;
        break;
      }
      case this.tileTypes.UPCOMING_EVENTS: {
        tileComponent = UpcomingEventsComponent;
        break;
      }
      case this.tileTypes.SINGLE_ITEM: {
        tileComponent = SingleItemComponent;
        break;
      }
      case this.tileTypes.LINKS: {
        tileComponent = LinksComponent;
        break;
      }
      case this.tileTypes.CHART: {
        tileComponent = ChartComponent;
        break;
      }
      default: {
        console.error(`Unknown tile type: ${tileType}`);
        break;
      }
    }
    return tileComponent;
  }

}
