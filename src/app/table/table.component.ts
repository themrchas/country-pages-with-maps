import { Input, Component, OnInit } from '@angular/core';
import { SpListService } from '../services/sp-list.service';
import * as moment from 'moment';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Input()
  settings: any;
  listItems: Array<any>;
  constructor(private spListService: SpListService) { }

  ngOnInit() {
    this.listItems = Array<any>();
    this.spListService.getListItems(this.settings.source.webURL, this.settings.source.listName,
      this.settings.source.order, this.settings.source.filter, this.settings.source.rowLimit).subscribe({
      next: response => {
        for (const result of response['d'].results) {
          result.title = result[this.settings.source.titleField.columnName];
          result.status = result[this.settings.source.statusField.columnName] ?
            result[this.settings.source.statusField.columnName].Description : '';
          result.time = moment(result[this.settings.source.timeField.columnName]);
          this.listItems.push(result);
        }
      }
    });
  }

}
