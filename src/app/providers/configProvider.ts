import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ConfigProvider {
    static settings: any;
    static env: string;

    constructor(private httpClient: HttpClient) {}


    load() {
      const jsonFile = 'assets/config.txt';
        return new Promise<void>((resolve, reject) => {
            this.httpClient.get(jsonFile).toPromise().then((response: Response) => {
              ConfigProvider.settings = response;
              ConfigProvider.env = ConfigProvider.settings.env;
              console.log('ConfigProvider.settings is', ConfigProvider.settings);
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
