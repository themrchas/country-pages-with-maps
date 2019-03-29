import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, empty, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { ConfigProvider } from '../providers/configProvider';

declare const _spPageContextInfo: any;

@Injectable({
  providedIn: 'root'
})
export class SpRestService {
  currSiteCollection: string;
  absRoot: string;

  constructor(private httpClient: HttpClient) {
    if (typeof _spPageContextInfo  !== 'undefined') {
      this.currSiteCollection = _spPageContextInfo.siteServerRelativeUrl;
      this.absRoot = _spPageContextInfo.siteAbsoluteUrl.replace(this.currSiteCollection, '');
    }
  }

  // TODO: This won't work if current site collection is root '/'
  isSameSiteCollectionAsCurrent(url) {
    /*return (typeof _spPageContextInfo  !== 'undefined') &&
      (url.startsWith(this.currSiteCollection) || url.startsWith(this.absRoot + this.currSiteCollection));*/
      return false;
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

  getListItems(listWeb: string,
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

  getListItemsCamlQuery(listWeb: string,
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
        return this.getListItemsCamlQuery(listWeb, listName, camlQuery, requestDigest);
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
