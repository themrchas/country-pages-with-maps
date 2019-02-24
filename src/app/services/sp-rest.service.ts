import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, empty } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpRestService {

  constructor(private httpClient: HttpClient) { }

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

  getListItems(listWeb: string, listName: string, order?: string, filter?: string, rowLimit?: number): Observable<Object>  {
    let reqUrl = `${listWeb}/_api/web/lists/getByTitle('${listName}')/items`;
    reqUrl += order || filter || rowLimit ? '?' : '';
    if (order) {
      reqUrl += '&$orderby=' + order;
    }
    if (filter) {
      reqUrl += order ? '&' : '';
      reqUrl += '&$filter=' + filter;
    }
    if (rowLimit) {
      reqUrl += order || filter ? '&' : '';
      reqUrl += '&$top=' + rowLimit;
    }

    return this.httpClient.get(reqUrl, this.spGetHttpOptions());
  }

  getListItemsCamlQuery(listWeb: string, listName: string, camlQuery: string, requestDigest?: string): Observable<Object>  {
    const reqUrl = `${listWeb}/_api/web/lists/getByTitle('${listName}')/GetItems(query=@v1)?@v1=${camlQuery}`;
    return this.httpClient.post(reqUrl, '{}', this.spPostHttpOptions(requestDigest));
  }

  getView(listWeb: string, listName: string, viewGuid: string): Observable<Object>  {
    return this.httpClient.get(`${listWeb}/_api/web/lists/getByTitle('${listName}')/views(guid'${viewGuid}')`,
      this.spGetHttpOptions());
  }

  getDocuments(listWeb: string, folderPath: string): Observable<Object>  {
    return this.httpClient.get(`${listWeb}/_api/web/getFolderByServerRelativeUrl('${folderPath}')/files`,
     this.spGetHttpOptions());
  }

  getContextInfo(webURL: string): Observable<Object> {
    return this.httpClient.post(`${webURL}/_api/contextinfo`, '{}', this.spGetHttpOptions());
  }

  // Each site collection stores user information, and the user id can differ between site collections
  getCurrentUser(userWebUrl: string) {
    return this.httpClient.get(userWebUrl + '/_api/web/currentUser', this.spGetHttpOptions()).pipe(map (resp => {
          const d = resp['d'];
          return d;
      }));
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
}
