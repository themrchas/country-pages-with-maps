import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseDataService } from './baseDataService';
import { DataSource, Column, SourceResult } from '../model/dataSource';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class WebtasService extends BaseDataService {

  constructor(private httpClient: HttpClient) {
    super();
  }

  getListItems(source: DataSource, filterObj?, columns?: Array<Column>): Observable<Array<SourceResult>> {
    const filter = source.filter ? BaseDataService.replacePlaceholdersWithFieldValues(source.filter, filterObj) : null;
    const where = filter ? `&where=${filter}` : '';
    const url = `${source.listWeb}?ddclass=${source.listName}&isall=true${where}`;

    return this.httpClient.get(url).pipe(map(resp => {
      let retResults = null;
      if (resp) {
        retResults = (resp as Array<Object>).map(result => {
          const processedColumns = [];
          if (columns) {
            for (const column of columns) {
              const colName = column.columnName;
              if (column.type === 'url') {
                processedColumns[colName] = {
                  'Url': result[colName],
                  'Description': colName // Ex:  Palantir Report will be the column name and URL text
                };
              } else if (column.type === 'newBadge') {
                const itemCreated = moment(result['CREATED_DATE']);
                const itemModified = moment(result['MODIFY_DATE']);
                processedColumns[colName] = this.getIsNewOrModified(itemCreated, itemModified);
              } else {
                processedColumns[colName] = result[colName];
              }
            }
          }
          return new SourceResult(
            source,
            processedColumns,
            null,
            result,
            null,
            null,
            null,
            null,
            null);
        });
      }
      return retResults;
    }));
  }
}
