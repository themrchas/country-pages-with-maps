import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { UtilitiesService } from '../services/utilities.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { mergeMap} from 'rxjs/operators';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private currentUser: any;
  constructor(private userService: UserService, private utilitiesService: UtilitiesService, private httpClient: HttpClient) { }

  getCurrentUser() {
      return this.currentUser ? of(this.currentUser) :
        this.userService.getCurrentUser(ConfigProvider.settings.metricsWebURL).pipe(map(result => {
          this.currentUser = result;
        }));
  }

  // Saving the metrics via REST API seems to only work if this runs in the same site collection as the metrics list,
  // Otherwise a Forbidden error will occur.
  sendSearchMetrics(queryText: String, action: String, dataset?: String, url?: String): Observable<any> {

    return this.getCurrentUser().pipe(mergeMap(() => {
      const metadata = {
        '__metadata': {
          'type': 'SP.Data.SearchMetricsListItem'
        },
        'Title': queryText,
        'SearchAction': action,
        'SelectedDataset': dataset,
        'UserId': this.currentUser['Id']
      };

      if (url) {
        metadata['SelectedURL'] = {
          '__metadata': { 'type': 'SP.FieldUrlValue' },
          'Description': url,
          'Url': url
        };
      }
      return this.httpClient.post(ConfigProvider.settings.searchMetricsWebURL + `/_api/web/lists/GetByTitle('` +
          ConfigProvider.settings.searchMetricsListName + `')/Items`, JSON.stringify(metadata), ConfigProvider.spPostHttpOptions());
      }));
  }

  // Save click information
  sendClickMetrics(clickData: string, clickEvent: any, selector: string): Observable<any> {
    const metadata = {
        '__metadata': {
          'type': 'SP.Data.ClickMetricsListItem'
        },
        'ScreenHeight': '' + screen.height,
        'ScreenWidth': '' + screen.width,
        'X': '' + clickEvent.pageX,
        'Y': '' + clickEvent.pageY,
        'Title': 'Click',
        'Data': clickData,
        'Element': clickEvent.target.tagName,
        'Browser': this.utilitiesService.getBrowser(),
        'Selector': selector
      };

    return this.httpClient.post(ConfigProvider.settings.clickMetricsWebURL + `/_api/web/lists/GetByTitle('` +
      ConfigProvider.settings.clickMetricsListName + `')/Items`, JSON.stringify(metadata), ConfigProvider.spPostHttpOptions());
  }
}
