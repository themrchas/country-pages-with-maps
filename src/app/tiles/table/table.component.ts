import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { SpRestService } from '../../services/sp-rest.service';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import { BehaviorSubject } from 'rxjs';
import { ConfigProvider } from '../../providers/configProvider';
import { CountryService } from '../../services/country.service';

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
  constructor(private spRestService: SpRestService, private countryService: CountryService) { }

  ngOnInit() {
    this.subscription = this.countryService.selectedCountry.subscribe(newCountry => {
      this.loadListItems(newCountry);
    });
  }

  loadListItems(country: Country) {
    let obs;
    this.listItems = Array<any>();

    // Check if the source settings use a caml query otherwise use a filter
    if (this.settings.source.camlQuery) {
      const viewXml = ConfigProvider.replacePlaceholdersWithFieldValues(this.settings.source.camlQuery, country);
      obs = this.spRestService.getListItemsCamlQuery(
        this.settings.source.listWeb,
        this.settings.source.listName,
        JSON.stringify({ViewXml: `${viewXml}`}),
        ConfigProvider.requestDigest);
    } else {
      obs = this.spRestService.getListItems(this.settings.source.listWeb, this.settings.source.listName,
        this.settings.source.order, this.settings.source.filter, this.settings.source.select,
        this.settings.source.expand, this.settings.source.rowLimit);
    }

    obs.subscribe({
      next: response => {
        for (const result of response['d'].results) {
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
