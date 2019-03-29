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
export class LinksComponent implements OnInit, OnDestroy {

  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;

  // Default background color for icons
  readonly defaultBackgroundColor: string = '#BEBEBE';

  // Default icon to use for link.  Used if not specified in in the links list.
  readonly defaultIconUrl: string = './assets/images/links-images/info42x42.png';

  // Items read from links list
  listItems: Array<any> = Array<any>();

  // False if logging not enabled
  doLog: boolean;

  subscription: any;

  constructor(private dataLayerService: DataLayerService) {}

  ngOnInit() {
  this.doLog = ConfigProvider.settings.debugLog;

   console.log('****Starting processing on links component in ngOnInit*****');

    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadLinks(selectedCountry);
    });

  } // ngOnInit

  loadLinks(country): void {

    from(this.settings.sources).pipe(mergeMap(source => {
      return this.dataLayerService.getItemsFromSource(new DataSource(source), country, this.settings.columns);
    })).subscribe({
      next: results => {

        // Loop over raw results returned from list query
       for (const result of results) {

          // Object that will contain columnName:value combination for each value returned in the response
          result.columns = {};

          for (const column of this.settings.columns) {

            console.log('result item:', result, 'and current column name', column.columnName);

            // Sharepoint link list returns URL as URL { Url:, Description: } and Comments,iconUrl,
            // and backgroundColor are first level properties
            result.columns[column.columnName] =
              (!/Comments|iconUrl|backgroundColor/.test(column.columnName)) ? result['URL'][column.columnName] : result[column.columnName];

          } // for

          // Set default values as required
          !result.columns['iconUrl']  && (result.columns['iconUrl'] = this.defaultIconUrl);
          !result.columns['backgroundColor'] && (result.columns['backgroundColor'] = this.defaultBackgroundColor);

          // Add formated object to list of items to be returned
          this.listItems.push(result.columns);

        } // for

        console.log('links to display are', this.listItems);
      } // next
    });  // subscribe

  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
