import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { mergeMap} from 'rxjs/operators';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private currentUser: any;
  constructor(private userService: UserService, private httpClient: HttpClient) { }

  getCurrentUser() {
      return this.currentUser ? of(this.currentUser) :
        this.userService.getCurrentUser(ConfigProvider.settings.metricsWebURL).pipe(map(result => {
          this.currentUser = result;
        }));
  }

  // Saving the metrics via REST API seems to only work if this runs in the same site collection as the metrics list,
  // Otherwise a Forbidden error will occur.
  sendMetrics(queryText: String, action: String, dataset?: String, url?: String): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': String($('#__REQUESTDIGEST').val()),
      })
    };

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
      return this.httpClient.post(ConfigProvider.settings.metricsWebURL + `/_api/web/lists/GetByTitle('` +
          ConfigProvider.settings.metricsListName + `')/Items`, JSON.stringify(metadata), httpOptions);
      }));
  }
}
