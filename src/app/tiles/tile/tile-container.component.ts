import { Component, OnInit, Input, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { TileDirective } from './tile.directive';
import { TableComponent } from '../table/table.component';
import { NewsComponent } from '../news/news.component';
import { MapComponent } from '../map/map.component';
import { TileComponent } from './tile.component';
import { Country } from '../../model/country';
import { BehaviorSubject } from 'rxjs';

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
    MAP: 'map'
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
