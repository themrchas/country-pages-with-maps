import { Injectable } from '@angular/core';
import { SpRestService } from './sp-rest.service';
import { DataSource } from '../model/dataSource';
import { ConfigProvider } from '../providers/configProvider';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  docIconPaths = new Map<string, string>();

  //control logging
  doLog: boolean = false;

  newDays: number = 1;

  constructor(private spRestService: SpRestService) {}


  getItemsFromSource(source: DataSource, filterObj?, columns?): Observable<Array<any>>  {
    let asyncRequest: Observable<Object>;
    let filter = source.filter;
    let camlQuery = source.camlQuery;

    this.doLog && console.log('--> source passed to  getItemsFromSource in data-layer,service is ' ,source);
    this.doLog && console.log(' --> filterObj is ',filterObj);
    this.doLog && console.log('--> columns are ', columns);
    

    if (filterObj) {
      camlQuery = source.camlQuery ?
          this.replacePlaceholdersWithFieldValues(source.camlQuery, filterObj) : source.camlQuery;
      filter = source.filter ?
          this.replacePlaceholdersWithFieldValues(source.filter, filterObj) : source.filter;
    }

    if (source.camlQuery) {
      // const viewXml = JSON.stringify({ViewXml: `${camlQuery}`});
      asyncRequest = this.spRestService.getListItemsCamlQuery(source.listWeb, source.listName, camlQuery,
        source.select, source.expand);
    } else {
      asyncRequest = this.spRestService.getListItems(source.listWeb, source.listName, source.order, filter,
          source.select, source.expand, source.rowLimit);
    }
    return asyncRequest.pipe(map(resp => {

      console.log('resp in data-layer.service is', resp);
      let retVal = null;
      if (resp && resp['d'] && resp['d'].results) {
        retVal = resp['d'].results;

          //iterate over list items returned
          retVal = retVal.map(result => {
            result.processedColumns = [];
            // process columns

            console.log('Processing columns in data-layer.service.ts using result',result);

            if (columns) {
              for (const column of columns) {
                const colName = column.columnName;


                this.doLog && console.log('in data-layer.service column is:', column, 'and colName is',colName);

                //Process a multi-valued managed metada column
                if (column.type === "mmm") {

                 this.doLog &&  console.log(' *** Processing column type mmm ***')

                  this.doLog && console.log(' *** result[colName] is ', result[colName], '***');
                  this.doLog && console.log(' *** result[colName][results] is ', result[colName]["results"], '***');

                  let labelMaker = function (previous, current) { return previous ? previous + "," + current.Label : current.Label; };

                  this.doLog && console.log(' *** result.processedColumns[colName] is ', result.processedColumns[colName], 'with colName', colName, ' ***');


                  result.processedColumns[colName] = result[colName]['results'].reduce(labelMaker, null);

                }

                else if (column.type === 'mm') {
                  result.processedColumns[colName] = result[colName].Label;
                } else if (column.type === 'date') {
                  result.processedColumns[colName] = moment(result[colName]).format('MM/DD/YYYY');
                } else if (column.type === 'expanded') {
                  const splitName = column.columnName.split('/');
                  result.processedColumns[colName] = splitName.length === 2 ? result[splitName[0]][splitName[1]] : null;
                } else if (column.type === 'url') {
                  // does anything actually need to be processed?
                  result.processedColumns[colName] = result[colName];
                } else if (column.type === 'docTypeIcon') {
                  const fileType = result[colName];
                  if (this.docIconPaths.has(fileType)) {
                    result.processedColumns[colName] = of(this.docIconPaths.get(fileType));
                  } else {
                    result.processedColumns[colName] =
                    this.spRestService.getDocIcon(source.listWeb, 'filename.' + fileType, 0).pipe(map(icon => {
                      const iconPath = '/_layouts/15/images/' + icon['d'].MapToIcon;
                      this.docIconPaths.set(fileType, iconPath);
                      return iconPath;
                    }));
                  }
                } else {
                  result.processedColumns[colName] = result[colName];
                }
              }
            }

            // Format URLs for displayform, web preview, full screen, download
            if (source.type === 'docLibrary') {
              const fileRef = result['FileRef'];
              result.spUrl$ = this.spRestService.getDisplayForm(source.listWeb,
                source.listName, result.Id);
              result.downloadUrl$ = of(source.listWeb + '/_layouts/15/download.aspx?SourceUrl=' + fileRef);
              result.webViewUrl$ = this.spRestService.getWOPIFrameUrl(source.listWeb, source.listName,
                result.Id, 3).pipe(map(response => {
                  const wopiFrame = response['d'].GetWOPIFrameUrl;
                  return wopiFrame.length > 0 ? wopiFrame : fileRef;
                }));
              result.fullScreenUrl$ = result.webViewUrl$.pipe(map(webViewUrl => {
                return (webViewUrl as string).replace('action=interactivepreview', 'action=view');
              }));
            } else {
              result.spUrl$ = this.spRestService.getDisplayForm(source.listWeb,
                source.listName, result.Id);
              result.webViewUrl$ = result.spUrl$.pipe(map(x => {
                return x + '&IsDlg=1';
              }));
            }

            //True if item was created less than 1 day ago
            result.processedColumns['isNew'] = moment().diff(moment(result.Created),'days') > 1;

            // Always add the source back to the result
            result.source = source;

            console.log(' *** Returning the following in data-layer.service', result, ' ***');

            return result;
          });
      }
      return retVal;
    }));
  }

  replacePlaceholdersWithFieldValues(str: string, item) {
      // const matchedItems = str.match(/(?<=\{\{)(.*?)(?=\}\})/g);
      // const matchedItems = str.match(/(?<=\)/g);
      const matchedItems = str.match(/\{\{(.*?)\}\}/g) || [];
      for (const matchedItem of matchedItems) {
          str = str.replace(`${matchedItem}`, item[matchedItem.replace(/\{\{/g, '').replace(/\}\}/g, '')]);
      }

      console.log('CamlQuery in replacePlaceholdersWithFieldValues modified with', item, 'and is', str );
      return str;
  }

}
