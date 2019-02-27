import { Input, Component, OnInit } from '@angular/core';
import { SpRestService } from '../../services/sp-rest.service';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, TileComponent {
  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;
  listItems: Array<any>;
  constructor(private spRestService: SpRestService) { }

  ngOnInit() {

    this.listItems = Array<any>();
    this.spRestService.getListItems(this.settings.source.webURL, this.settings.source.listName,
      this.settings.source.order, this.settings.source.filter, this.settings.source.rowLimit).subscribe({
      next: response => {
        for (const result of response['d'].results) {
          result.columns = [];
          for (const column of this.settings.columns) {
            result.columns.push(result[column.columnName]);
          }
          this.listItems.push(result);
        }
      }
    });

    this.country.subscribe(newCountry => {
      console.log('Country changed');
    });
  }

}
