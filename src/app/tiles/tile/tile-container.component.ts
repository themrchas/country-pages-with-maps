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

@Component({
  selector: 'app-tile',
  templateUrl: './tile-container.component.html',
  styleUrls: ['./tile-container.component.css']
})
export class TileContainerComponent implements OnInit {
  @Input() tile: any;
  @Input() country: BehaviorSubject<Country>;
  @ViewChild(TileDirective) tileDirective: TileDirective;

  tileTypes = {
    TABLE: 'table',
    NEWS: 'news',
    MAP: 'map',
    FACTBOX: 'fact-box',
    GENTABLE: 'gen-table', // Chas
    TABS: 'tabs'
  };
  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    let tileComponent;
    if (this.tile.type === this.tileTypes.TABLE) {
      tileComponent = TableComponent;
    } else if (this.tile.type === this.tileTypes.NEWS) {
      tileComponent = NewsComponent;
    } else if (this.tile.type === this.tileTypes.MAP) {
      tileComponent = MapComponent;
    } else if (this.tile.type === this.tileTypes.FACTBOX) {
      tileComponent = CountryFactBoxComponent;
    } else if (this.tile.type === this.tileTypes.GENTABLE) {
      tileComponent = GenericTableComponent;
    } else if (this.tile.type === this.tileTypes.TABS) {
      tileComponent = TabsComponent;
    } else {
      console.error(`Unknown tile type: ${this.tile.type}`);
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      tileComponent);

    const viewContainerRef = this.tileDirective.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (componentRef.instance as TileComponent).settings = this.tile.settings;
    (componentRef.instance as TileComponent).country = this.country;
  }

}
