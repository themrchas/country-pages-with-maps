import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class SpListService {

  constructor(private httpClient: HttpClient) { }

  getView(listWeb: string, listName: string, viewGuid: string) {
    return this.httpClient.get(`${listWeb}/_api/web/lists/getByTitle('${listName}')/views(guid'${viewGuid}')`,
      ConfigProvider.spGetHttpOptions());
  }

  getDocuments(listWeb: string, folderPath: string) {
    return this.httpClient.get(`${listWeb}/_api/web/getFolderByServerRelativeUrl('${folderPath}')/files`,
      ConfigProvider.spGetHttpOptions());
  }
}
