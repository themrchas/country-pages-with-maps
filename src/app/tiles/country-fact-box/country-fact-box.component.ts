import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';

@Component({
  selector: 'app-country-fact-box',
  templateUrl: './country-fact-box.component.html',
  styleUrls: ['./country-fact-box.component.scss']
})
export class CountryFactBoxComponent implements OnInit, TileComponent {
  @Input() country: BehaviorSubject<Country>;
  @Input() settings: any;
  constructor() { }

  ngOnInit() {
  }

}
