import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigProvider {
    static settings: any;
    static env: string;
    static requestDigest: string;

    constructor(private httpClient: HttpClient) {}

    load() {
      const jsonFile = environment.configPath;
        return new Promise<void>((resolve, reject) => {
            this.httpClient.get(jsonFile).toPromise().then((response: any) => {
              ConfigProvider.settings = response;
              ConfigProvider.env = ConfigProvider.settings.env;
            }).catch((response: any) => {
              reject(`Could not load file '${jsonFile}':${JSON.stringify(response)}`);
            }).then(() => {
                // check if within SharePoint by retrieving request digest on page,
                // otherwise need to retrieve context info from SharePoint
                const rdOnPage = document.getElementById('__REQUESTDIGEST') as HTMLInputElement;
                if (rdOnPage) {
                    ConfigProvider.requestDigest = String(rdOnPage.value);
                    resolve();
                } else if (environment.mockSp) {
                  resolve();
                } else {
                    this.httpClient.post(`${ConfigProvider.settings.country.listWeb}/_api/contextinfo`, '{}', {
                        headers: new HttpHeaders({
                          Accept: 'application/json;odata=verbose'
                        })
                    }).subscribe(contextInfo => {
                        ConfigProvider.requestDigest = contextInfo['d'].GetContextWebInformation.FormDigestValue;
                        resolve();
                    }, error => {
                        console.error(error);
                        resolve();  // For now, still resolve for testing purposes
                    });
                }
            });
        });
    }
}

export function configProviderFactory(provider: ConfigProvider) {
    return () => provider.load();
}
