import { Component, OnInit, Input, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { TileDirective } from './tile.directive';
import { TableComponent } from '../table/table.component';
import { NewsComponent } from '../news/news.component';
import { MapComponent } from '../map/map.component';
import { TileComponent } from './tile.component';
import { TabsComponent } from '../tabs/tabs.component';


// Chas
import { GenericTableComponent } from '../generic-table/generic-table.component';


import { Country } from '../../model/country';
import { BehaviorSubject } from 'rxjs';
import { CountryFactBoxComponent } from '../country-fact-box/country-fact-box.component';
import { UpcomingEventsComponent } from '../upcoming-events/upcoming-events.component';

@Component({
  selector: 'app-tile',
  templateUrl: './tile-container.component.html',
  styleUrls: ['./tile-container.component.css']
})
export class TileContainerComponent implements OnInit {
  @Input() tile: any;
  @Input() country: BehaviorSubject<Country>;
  @ViewChild(TileDirective) tileDirective: TileDirective;
  sources: Array<any>;

  tileTypes = {
    TABLE: 'table',
    NEWS: 'news',
    MAP: 'map',
    FACTBOX: 'fact-box',
    GENTABLE: 'gen-table', // Chas
    TABS: 'tabs',
    UPCOMING_EVENTS: 'upcoming-events'
  };
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    const tileComponent = this.getTileComponent(this.tile.type);

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      tileComponent);

    const viewContainerRef = this.tileDirective.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as TileComponent).settings = this.tile.settings;
    (componentRef.instance as TileComponent).country = this.country;

    if (this.tile.settings) {
      if (this.tile.settings.source) {
        this.sources = [this.tile.settings.source];
      } else {
        this.sources = this.tile.settings.sources;
      }
    }
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
      case this.tileTypes.FACTBOX: {
        tileComponent = CountryFactBoxComponent;
        break;
      }
      case this.tileTypes.GENTABLE: {
        tileComponent = GenericTableComponent;
        break;
      }
      case this.tileTypes.TABS: {
        tileComponent = TabsComponent;
        break;
      }
      case this.tileTypes.UPCOMING_EVENTS: {
        tileComponent = UpcomingEventsComponent;
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
