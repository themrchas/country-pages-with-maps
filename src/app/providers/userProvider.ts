import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class UserProvider {

    constructor(private httpClient: HttpClient) {}

    // Each site collection stores user information, and the user id can differ between site collections
    getCurrentUser(userWebUrl: string) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'application/json;odata=verbose'
            })
        };

        return this.httpClient.get(userWebUrl + '/_api/web/currentUser', httpOptions).pipe(map (resp => {
                const d = resp['d'];
                return d;
            }));
    }
}
