import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import { DataLayerService } from '../../services/data-layer.service';
import { DataSource } from '../../model/dataSource';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-single-item',
  templateUrl: './single-item.component.html',
  styleUrls: ['./single-item.component.scss']
})
export class SingleItemComponent implements OnInit, OnDestroy, TileComponent {
  @Input() country: BehaviorSubject<Country>;
  @Input() settings: any;
  singleItem: any;
  subscription: any;
  constructor(private dataLayerService: DataLayerService) { }

  ngOnInit() {

    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadItem(selectedCountry);
    });

  }

  loadItem(country: Country) {

    if (this.settings.source) {
      this.settings.source.rowLimit = 1;
      this.dataLayerService.getItemsFromSource(new DataSource(this.settings.source),
        this.country, this.settings.columns).subscribe(arrResp => {
          if (arrResp && arrResp.length > 0) {
            this.singleItem = arrResp[0];
          }
        });
    } else {
      // If no source is provided, default to using the current country
      this.singleItem = country;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
