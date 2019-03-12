import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { mergeMap, catchError } from 'rxjs/operators';
import { DataSource } from '../model/dataSource';
import { NewsItem, createNewsItemFromSharePointResult} from '../model/news';
import { from, empty } from 'rxjs';
import { DataLayerService } from './data-layer.service';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(private httpClient: HttpClient, private dataLayerService: DataLayerService) { }

  getNewsFromSources(sources: Array<DataSource>, filterObj): Promise<Array<NewsItem>> {

    const newsItems = Array<NewsItem>();
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose'
      })
    };

    // Request news from each of the sources, compile results into the newsItems array
    // When complete, resolve the promise
    return new Promise<Array<NewsItem>>((resolve) => {

      const getNewsFromSourceObservable = source => {
        return this.dataLayerService.getItemsFromSource(source, filterObj).pipe(
          catchError(error => {
          return empty();
        }));
      };
      from(sources).pipe(mergeMap(source => getNewsFromSourceObservable(source), (sourceItem, observableItem) => {
        return {
          sourceItem: sourceItem,
          resultSet: observableItem
        };
      })).subscribe({
          next: val => {
            for (const result of (val.resultSet as Array<any>)) {
              const newsItem: NewsItem = createNewsItemFromSharePointResult(result, val.sourceItem);
              newsItems.push(newsItem);
            }
          },
          complete: () => resolve(newsItems)
      });
    });
  }
}
