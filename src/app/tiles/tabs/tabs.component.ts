import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TileComponent } from '../tile/tile.component';
import { Country } from '../../model/country';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, TileComponent {
  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;
  constructor() { }

  ngOnInit() {
    console.log(this.settings.tabs);
  }

}
