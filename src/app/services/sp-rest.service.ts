import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, empty, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { ConfigProvider } from '../providers/configProvider';
import { environment } from '../../environments/environment';
import { BaseDataService } from './baseDataService';
import { DataSource, Column, SourceResult, SourceDataType } from '../model/dataSource';
import * as moment from 'moment';

declare const _spPageContextInfo: any;

@Injectable({
  providedIn: 'root'
})
export class SpRestService extends BaseDataService {
  currSiteCollection: string;
  absRoot: string;

  constructor(private httpClient: HttpClient) {
    super();
    if (typeof _spPageContextInfo  !== 'undefined') {
      this.currSiteCollection = _spPageContextInfo.siteServerRelativeUrl;
      this.absRoot = _spPageContextInfo.siteAbsoluteUrl.replace(this.currSiteCollection, '');
    }
  }

  // For now, just always return false (which will force retrieving the contextinfo) EXCEPT when in the mock sp env
  isSameSiteCollectionAsCurrent(url) {
    // TODO: This won't work if current site collection is root '/'
    /*return (typeof _spPageContextInfo  !== 'undefined') &&
      (url.startsWith(this.currSiteCollection) || url.startsWith(this.absRoot + this.currSiteCollection));*/
      return environment.mockSp;
  }

  spGetHttpOptions() {
    return {
      headers: new HttpHeaders({
        Accept: 'application/json;odata=verbose'
      })
    };
  }

  spPostHttpOptions(requestDigest?) {
    return {
      headers: new HttpHeaders({
        Accept: 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-HTTP-Method': 'POST',
        'X-RequestDigest': requestDigest ? requestDigest :
          String((document.getElementById('__REQUESTDIGEST') as HTMLInputElement).value),
      })
    };
  }

  labelMakerMMM(previous, current) {
    return previous ? previous + ', ' + current.Label : current.Label;
  }

  labelMakerMultiChoice(previous, current) {
    return previous ? previous + ', ' + current : current;
  }

  spPostUpdateHttpOptions(requestDigest?) {
    return {
      headers: new HttpHeaders({
        Accept: 'application/json;odata=verbose',
        'Content-Type': 'application/json;odata=verbose',
        'X-RequestDigest': requestDigest ? requestDigest :
          String((document.getElementById('__REQUESTDIGEST') as HTMLInputElement).value),
        'IF-MATCH': '*',
        'X-HTTP-METHOD': 'MERGE'
      })
    };
  }

  getListItems(source: DataSource, filterObj?, columns?: Array<Column>): Observable<Array<SourceResult>> {
    let asyncRequest: Observable<Object>;
    let filter = source.filter;
    let camlQuery = source.camlQuery;

    if (filterObj) {
      camlQuery = source.camlQuery ?
          this.replacePlaceholdersWithFieldValues(source.camlQuery, filterObj) : source.camlQuery;
      filter = source.filter ?
          this.replacePlaceholdersWithFieldValues(source.filter, filterObj) : source.filter;
    }

    if (source.camlQuery) {
      asyncRequest = this._getListItemsCamlQuery(source.listWeb, source.listName, camlQuery,
        source.select, source.expand);
    } else {
      asyncRequest = this._getListItems(source.listWeb, source.listName, source.order, filter,
          source.select, source.expand, source.rowLimit);
    }

    return asyncRequest.pipe(map(resp => {

      console.log('resp in sp-rest.service is', resp);
      let retResults = null;
  

      if (resp && resp['d'] && resp['d'].results) {
          const spResults = resp['d'].results;

          // iterate over list items returned
          retResults = spResults.map(result => {
            console.log('Processing columns in sp-rest.service.ts using result', result);

            // process columns
            const processedColumns = [];
            if (columns) {
              for (const column of columns) {
                const colName = column.columnName;

                // Process a multi-valued managed metada column
               if (column.type === 'mmm') {
                  processedColumns[colName] = result[colName]['results'].reduce(this.labelMakerMMM, null);
                } else if (column.type === 'mm') {
                  processedColumns[colName] = result[colName] ? result[colName].Label : '';
                } else if (column.type === 'date') {
                  processedColumns[colName] = moment(result[colName]).format('MM/DD/YYYY');
                } else if (column.type === 'expanded') {
                  const splitName = column.columnName.split('/');
                  processedColumns[colName] = splitName.length === 2 ? result[splitName[0]][splitName[1]] : null;
                } else if (column.type === 'multi-choice') {
                  processedColumns[colName] = result[colName]['results'].reduce(this.labelMakerMultiChoice, null);
                } else if (column.type === 'linksUrl') {
                  //Links list packages Url and Desription as URL: {Url:'', Description:''}
                  processedColumns[colName] = result['URL'][colName];
                } else if (column.type === 'boolean') {
                  processedColumns[colName] = result[colName] ? 'Yes' : 'No';
                } else if (column.type === 'rich-text') {
                  processedColumns[colName] = result[colName] ? this.getHtmlTextContent(result[colName]) : '';
                }
                  else if (column.type === 'newBadge') {

                    let itemCreated = moment(result['Created'], 'YYYY-MM-DDTHH:mm:SS');
                    let itemModified = moment(result['Modified'], 'YYYY-MM-DDTHH:mm:SS');
                    
                   if (moment.duration(moment().diff(itemCreated)).as('hours') <= 24)                    
                       processedColumns[colName] = "New";
                   else if (moment.duration(moment().diff(itemModified)).as('hours') <= 24)
                        processedColumns[colName] = "Updated";
                    
              
                
                }

                else if (column.type === 'docTypeIcon') {
                  const fileType = result[colName];
                  if (this.docIconPaths.has(fileType)) {
                    processedColumns[colName] = of(this.docIconPaths.get(fileType));
                  } else {
                    processedColumns[colName] =
                      this.getDocIcon(source.listWeb, 'filename.' + fileType, 0).pipe(map(icon => {
                        const iconPath = source.listWeb + '/_layouts/15/images/' + icon['d'].MapToIcon;
                        this.docIconPaths.set(fileType, iconPath);
                        return iconPath;
                      }));
                  }

                } else {
                  processedColumns[colName] = result[colName];
                }
              }
            }

            // Format URLs for displayform, web preview, full screen, download
            let itemUrl$, downloadUrl$, previewUrl$, fullScreenUrl$;
            if (source.type === SourceDataType.DOC_LIBRARY) {
              const fileRef = result['FileRef'];
              itemUrl$ = this.getDisplayForm(source.listWeb,
                source.listName, result.Id);
              downloadUrl$ = of(source.listWeb + '/_layouts/15/download.aspx?SourceUrl=' + fileRef);
              previewUrl$ = this.getWOPIFrameUrl(source.listWeb, source.listName,
                result.Id, 3).pipe(map(response => {
                  const wopiFrame = response['d'].GetWOPIFrameUrl;
                  return wopiFrame.length > 0 ? wopiFrame : fileRef;
                }));
              fullScreenUrl$ = previewUrl$.pipe(map(previewUrl => {
                return (previewUrl as string).replace('action=interactivepreview', 'action=view');
              }));
            } else {
              itemUrl$ = this.getDisplayForm(source.listWeb,
                source.listName, result.Id);
              previewUrl$ = itemUrl$.pipe(map(x => {
                return x + '&IsDlg=1';
              }));
            }

            // TODO:  Right now we rely on the source configuration being right.  We should make this smarter.
            // Created, Title, Id need to always be requested if there is a select
            // File needs to be always expanded if source is a docLibrary,
            // with File Type and FileRef always being requested in the select

            return new SourceResult(
              source,
              processedColumns,
              result,
              moment().diff(moment(result.Created), 'days') < 1, // True if item was created less than 1 day ago
              (source.type === SourceDataType.DOC_LIBRARY ? result.File.Name : result.Title),
              result.Id,
              itemUrl$,
              result.File_x0020_Type,
              downloadUrl$,
              previewUrl$,
              fullScreenUrl$
            );
          });
      }
      return retResults;
    }));
  }

  _getListItems(listWeb: string,
        listName: string,
        order?: string,
        filter?: string,
        select?: string,
        expand?: string,
        rowLimit?: number): Observable<any>  {

    let reqUrl = `${listWeb}/_api/web/lists/getByTitle('${listName}')/items`;
    reqUrl += order || filter || rowLimit || select || expand ? '?' : '';
    if (order) {
      reqUrl += '&$orderby=' + order;
    }
    if (filter) {
      reqUrl += order ? '&' : '';
      reqUrl += '$filter=' + filter;
    }
    if (select) {
      reqUrl += order || filter ? '&' : '';
      reqUrl += '$select=' + select;
    }
    if (expand) {
      reqUrl += order || expand ? '&' : '';
      reqUrl += '$expand=' + expand;
    }
    if (rowLimit) {
      reqUrl += order || filter || select ? '&' : '';
      reqUrl += '$top=' + rowLimit;
    }

    return this.httpClient.get(reqUrl, this.spGetHttpOptions());
  }

  _getListItemsCamlQuery(listWeb: string,
    listName: string,
    camlQuery: string,
    select?: string,
    expand?: string): Observable<Object>  {

    const data = {
      query: {
        __metadata: {
          type: 'SP.CamlQuery'
        },
        ViewXml: camlQuery
      }
    };

    let optParams = '';
    if (select) {
      optParams += '&$select=' + select;
    }
    if (expand) {
      optParams += select ? '&' : '';
      optParams += '$expand=' + expand;
    }

    // const reqUrl = `${listWeb}/_api/web/lists/getByTitle('${listName}')/GetItems(query=@v1)?@v1=${camlQuery}${optParams}`;
    const reqUrl = `${listWeb}/_api/web/lists/getByTitle('${listName}')/GetItems?${optParams}`;

    console.log('reqUrl in sp-rest.service.ts is', reqUrl, 'and optParams are:', optParams, '**', 'and data is', data );


    return this.getRequestDigest(listWeb).pipe(mergeMap(requestDigest => {
      return this.httpClient.post(reqUrl, JSON.stringify(data), this.spPostHttpOptions(requestDigest));
    }));
  }

  /*getListItemsCamlQuery(listWeb: string,
      listName: string,
      camlQuery: string,
      select?: string,
      expand?: string,
      requestDigest?: string): Observable<Object>  {

    let optParams = '';
    if (select) {
      optParams += '&$select=' + select;
    }
    if (expand) {
      optParams += select ? '&' : '';
      optParams += '$expand=' + expand;
    }

    const reqUrl = `${listWeb}/_api/web/lists/getByTitle('${listName}')/GetItems(query=@v1)?@v1=${camlQuery}${optParams}`;
    return this.httpClient.post(reqUrl, '{}', this.spPostHttpOptions(requestDigest));
  }*/

  getView(listWeb: string, listName: string, viewGuid: string): Observable<Object>  {
    return this.httpClient.get(`${listWeb}/_api/web/lists/getByTitle('${listName}')/views(guid'${viewGuid}')`,
      this.spGetHttpOptions());
  }

  getDocuments(listWeb: string, folderPath: string): Observable<Object>  {
    return this.httpClient.get(`${listWeb}/_api/web/getFolderByServerRelativeUrl('${folderPath}')/files`,
     this.spGetHttpOptions());
  }

  getContextInfo(listWeb: string): Observable<Object> {
    return this.httpClient.post(`${listWeb}/_api/contextinfo`, '{}', this.spGetHttpOptions());
  }

  // Each site collection stores user information, and the user id can differ between site collections
  getCurrentUser(userlistWeb: string) {
    return this.httpClient.get(userlistWeb + '/_api/web/currentUser', this.spGetHttpOptions()).pipe(map (resp => {
          const d = resp['d'];
          return d;
      }));
  }

  getRequestDigest(listWeb: string): Observable<any> {
    let asyncRequest;
    if (this.isSameSiteCollectionAsCurrent(listWeb)) {
      asyncRequest = of(ConfigProvider.requestDigest);
    } else {
      asyncRequest = this.getContextInfo(listWeb).pipe(map((contextInfo) => {
        return contextInfo['d'].GetContextWebInformation.FormDigestValue;
      }));
    }
    return asyncRequest;
  }

  getListItemsByView(listWeb, listName, viewGuid, requestDigest?) {
    return this.getView(listWeb, listName, viewGuid).pipe(
        catchError(error => {
          console.warn('Could not find view by GUID: ' + viewGuid);
          return empty();
      })).pipe(mergeMap(viewData => {
        const viewQuery = '<Query>' + viewData['d'].ViewQuery + '</Query>';
        const camlQuery = JSON.stringify({ViewXml: `${viewQuery}`});
        return this._getListItemsCamlQuery(listWeb, listName, camlQuery, requestDigest);
      }));
  }

  // Action is the SPWOPIFrameAction enumeration number (0 - 2)
  getWOPIFrameUrl(listWeb, listName, itemId, action: number) {
    return this.getRequestDigest(listWeb).pipe(mergeMap(requestDigest => {
      return this.httpClient.post(
        `${listWeb}/_api/web/lists/getByTitle('${listName}')/items(${itemId})/getWOPIFrameUrl(${action})`,
        '{}',
        this.spPostHttpOptions(requestDigest));
    }));
  }

  getDocIcon(listWeb: string, filename: string, size: number) {
    return this.httpClient.get(`${listWeb}/_api/web/mapToIcon(filename='${filename}',progid='',size=${size})`,
      this.spGetHttpOptions());
  }

  getDisplayForm(listWeb: string, listName: string, itemId) {
    return this.httpClient.get(`${listWeb}/_api/web/lists/getByTitle('${listName}')/Forms?select=ServerRelativeUrl&$filter=FormType eq 4`,
      this.spGetHttpOptions()).pipe(map(resp => {
        return resp['d'].results[0].ServerRelativeUrl + '?ID=' + itemId;
      }));
  }
}
