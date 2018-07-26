import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(private httpClient: HttpClient) { }

  getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getView(listWeb: string, listName: string, viewGuid: string) {
    return this.httpClient.get(`${listWeb}/_api/web/lists/getByTitle('${listName}')/views(guid'${viewGuid}')`,
      ConfigProvider.spJsonHttpOptions);
  }
}
