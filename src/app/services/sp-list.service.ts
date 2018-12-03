import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class SpListService {

  constructor(private httpClient: HttpClient) { }

  getListItems(listWeb: string, listName: string, order?: string, filter?: string, rowLimit?: number) {
    let reqUrl = `${listWeb}/_api/web/lists/getByTitle('${listName}')/items`;
    reqUrl += order || filter || rowLimit ? '?' : '';
    if (order) {
      reqUrl += '$orderby=' + order;
    }
    if (filter) {
      reqUrl += order ? '&' : '';
      reqUrl += '$filter=' + filter;
    }
    if (top) {
      reqUrl += order || filter ? '&' : '';
      reqUrl += '$top=' + rowLimit;
    }

    return this.httpClient.get(reqUrl, ConfigProvider.spGetHttpOptions());
  }

  getView(listWeb: string, listName: string, viewGuid: string) {
    return this.httpClient.get(`${listWeb}/_api/web/lists/getByTitle('${listName}')/views(guid'${viewGuid}')`,
      ConfigProvider.spGetHttpOptions());
  }

  getDocuments(listWeb: string, folderPath: string) {
    return this.httpClient.get(`${listWeb}/_api/web/getFolderByServerRelativeUrl('${folderPath}')/files`,
      ConfigProvider.spGetHttpOptions());
  }
}
