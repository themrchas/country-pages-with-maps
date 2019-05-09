import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeospatialService {
  private africaGeoJson: Observable<any>;
  private geoJsonPath = './assets/geo/africa.txt';
  constructor(private httpClient: HttpClient) { }

  // Only retrieve the geoJson once
  getAfricaGeoJson() {
    return this.africaGeoJson || this.httpClient.get(this.geoJsonPath).pipe(response => {
      this.africaGeoJson = response;
      return response;
    });
  }
}
