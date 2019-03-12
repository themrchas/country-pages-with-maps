import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { SpRestService } from '../../services/sp-rest.service';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import { BehaviorSubject } from 'rxjs';
import { ConfigProvider } from '../../providers/configProvider';
import { CountryService } from '../../services/country.service';
import { DataSource } from '../../model/dataSource';
import { DataLayerService } from '../../services/data-layer.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnDestroy, TileComponent {
  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;
  listItems: Array<any>;
  subscription: any;
  constructor(private dataLayerService: DataLayerService, private countryService: CountryService) { }

  ngOnInit() {
    this.subscription = this.countryService.selectedCountry.subscribe(newCountry => {
      this.loadListItems(newCountry);
    });
  }

  loadListItems(country: Country) {
    let obs;
    this.listItems = Array<any>();

    // Check if the source settings use a caml query otherwise use a filter
    this.settings.source.replaceItem = country;
    obs = this.dataLayerService.getItemsFromSource(this.settings.source as DataSource,
      country);

    obs.subscribe({
      next: results => {
        for (const result of results) {
          result.columns = [];
          for (const column of this.settings.columns) {
            let colStr = result[column.columnName];
            if (column.type === 'mm') {
              colStr =  colStr ? colStr.Label : '';
            } else if (column.type === 'date') {
              // TODO: format
            }
            result.columns.push(colStr);
          }
          this.listItems.push(result);
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
