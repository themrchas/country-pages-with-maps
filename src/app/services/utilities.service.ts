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
      ConfigProvider.spGetHttpOptions());
  }

  getBrowser() {
    const ua = navigator.userAgent;
    let tem = null;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) {
        return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    return M.join(' ');
  }
}
