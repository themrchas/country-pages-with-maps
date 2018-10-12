/*import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


export class ConfigProvider {
  static settings: any;
  constructor(private http: HttpClient) {}

  load() {
    const jsonFile = 'assets/config.json';
      return new Promise<void>((resolve, reject) => {
          this.http.get(jsonFile).toPromise().then((response: Response) => {
            ConfigProvider.settings = response.json();
            resolve();
          }).catch((response: any) => {
            reject(`Could not load file '${jsonFile}':${JSON.stringify(response)}`);
          });
      });
  }
}

export function configProviderFactory(provider: ConfigProvider) {
    return () => provider.load();
}*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class ConfigProvider {
    static settings: any;
    static env: string;
    static spGetHttpOptions() {
      return {
        headers: new HttpHeaders({
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        })
      };
    }

    static spPostHttpOptions() {
      return {
        headers: new HttpHeaders({
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': String($('#__REQUESTDIGEST').val()),
        })
      };
    }

    constructor(private httpClient: HttpClient) {}


    load() {
      const jsonFile = 'assets/config.txt';
        return new Promise<void>((resolve, reject) => {
            this.httpClient.get(jsonFile).toPromise().then((response: Response) => {
              ConfigProvider.settings = response;
              ConfigProvider.env = ConfigProvider.settings.env;
              resolve();
            }).catch((response: any) => {
              reject(`Could not load file '${jsonFile}':${JSON.stringify(response)}`);
            });
        });
    }
}

export function configProviderFactory(provider: ConfigProvider) {
    return () => provider.load();
}
