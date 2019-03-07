import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { mergeMap, catchError } from 'rxjs/operators';
import { NewsItem, NewsSource, createNewsItemFromSharePointResult } from '../model/news';
import { SpRestService } from './sp-rest.service';
import { Observable, from, empty } from 'rxjs';
import * as moment from 'moment';
import { ConfigProvider } from '../providers/configProvider';
import { Country } from '../model/country';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(private httpClient: HttpClient, private spRestService: SpRestService) { }

  getNewsFromSources(sources: Array<NewsSource>, country: Country): Promise<Array<NewsItem>> {

    const newsItems = Array<NewsItem>();
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      })
    };
    // Filter on approved (published) items
    const approvedFilter = 'OData__ModerationStatus eq 0';

    // Request news from each of the sources, compile results into the newsItems array
    // When complete, resolve the promise
    return new Promise<Array<NewsItem>>((resolve) => {

      const getNewsFromSourceObservable = source => {
        let filter = source.filter ? ConfigProvider.replacePlaceholdersWithFieldValues(source.filter, country) : '';
        if (source.beginDaysAgo) {
          filter += filter ? ' and ' : '';
          filter += `${source.dateField} ge dateTime'${moment().startOf('day').add(source.beginDaysAgo, 'days').toISOString()}`;
        }

        let asyncRequest;
        if (source.type === 'docLibrary') {
          asyncRequest = this.spRestService.getDocuments(source.listWeb, source.listName).pipe(
            catchError(error => {
            return empty();
          }));
        } else if (source.type === 'list') {
          asyncRequest = this.spRestService.getListItems(source.listWeb, source.listName, source.order,
            source.filter, source.select, source.expand, source.rowLimit).pipe(
            catchError(error => {
            return empty();
          }));
        } else {
          /*asyncRequest = this.httpClient.get(source.listWeb + `/_api/web/lists/GetByTitle('${source.listName}')/Items?` +
          `$filter=${approvedFilter} and ${source.dateField} ge dateTime'${startISO}'`, httpOptions).pipe(
            catchError(error => {
            return empty();
          }));*/
          asyncRequest = this.spRestService.getListItems(source.listWeb, source.listName, source.order,
            filter, source.select, source.expand, source.rowLimit).pipe(
              catchError(error => {
              return empty();
            }));
        }
        return asyncRequest;
      };
      from(sources).pipe(mergeMap(source => getNewsFromSourceObservable(source), (sourceItem, observableItem) => {
        return {
          sourceItem: sourceItem,
          resultSet: observableItem
        };
      })).subscribe({
          next: val => {
            for (const result of val.resultSet['d']['results']) {
              const newsItem: NewsItem = createNewsItemFromSharePointResult(result, val.sourceItem as NewsSource);
              newsItems.push(newsItem);
            }
          },
          complete: () => resolve(newsItems)
      });
    });
  }
}
