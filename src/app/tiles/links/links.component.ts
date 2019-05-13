import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { Country } from '../../model/country';
import { DataLayerService } from '../../services/data-layer.service';
import { mergeMap } from 'rxjs/operators';
import { DataSource } from 'src/app/model/dataSource';
import { ConfigProvider } from '../../providers/configProvider';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

  @Input() settings: any;
  @Input() country: Country;

  // Default background color for icons
  readonly defaultBackgroundColor: string = '#BEBEBE';

  // Default icon to use for link.  Used if not specified in in the links list.
  readonly defaultIconUrl: string = './assets/images/links-images/info42x42.png';

  // Items read from links list
  listItems: Array<any> = Array<any>();

  // False if logging not enabled
  doLog: boolean;

  constructor(private dataLayerService: DataLayerService) {}

  ngOnInit() {
    this.doLog = ConfigProvider.settings.debugLog;
    this.doLog && console.log('****Starting processing on links component in ngOnInit*****');

    this.loadLinks(this.country);

  } // ngOnInit

  loadLinks(country): void {

    this.doLog && console.log('---->links.component.ts with country', country, 'and settings.sources',
      this.settings.sources, 'settings.columns', this.settings.columns);

    from(this.settings.sources).pipe(mergeMap(source => {
      return this.dataLayerService.getItemsFromSource(new DataSource(source), country, this.settings.columns);
    })).subscribe({
      next: results => {

        // Loop over raw results returned from list query
       for (const result of results) {

          // Object that will contain columnName:value combination for each value returned in the response
          const columns = {};

          for (const column of this.settings.columns) {

            this.doLog && console.log('result processedColumns for item:', result, 'and current column name', column.columnName);
            columns[column.columnName] = result.processedColumns[column.columnName];
          } // for

          // Set default values as required
          !columns['iconUrl']  && (columns['iconUrl'] = this.defaultIconUrl);
          !columns['backgroundColor'] && (columns['backgroundColor'] = this.defaultBackgroundColor);

          // Add formated object to list of items to be returned
          this.listItems.push(columns);

        } // for

        this.doLog && console.log('links to display are', this.listItems);
      } // next
    });  // subscribe

  }

}
