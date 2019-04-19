import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import { DataLayerService } from '../../services/data-layer.service';
import { DataSource } from '../../model/dataSource';

@Component({
  selector: 'app-single-item',
  templateUrl: './single-item.component.html',
  styleUrls: ['./single-item.component.scss']
})
export class SingleItemComponent implements OnInit, TileComponent {
  @Input() country: Country;
  @Input() settings: any;
  singleItem: any;
  constructor(private dataLayerService: DataLayerService) { }

  ngOnInit() {
    this.loadItem(this.country);
  }

  loadItem(country: Country) {

    if (this.settings.source) {
      this.settings.source.rowLimit = 1;
      this.dataLayerService.getItemsFromSource(new DataSource(this.settings.source),
        country, this.settings.columns).subscribe(arrResp => {
          if (arrResp && arrResp.length > 0) {
            this.singleItem = arrResp[0].processedColumns;
          }
        });
    } else if (this.settings.item) {
      this.singleItem = this.settings.item;
    } else {
      // If no source or item is provided, default to using the current country
      this.singleItem = country;
    }
  }
}
