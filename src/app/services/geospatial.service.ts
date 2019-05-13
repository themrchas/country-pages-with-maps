import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';

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

  getTileLayer(L) {
    let mapLayer;
    const mapServiceSettings = ConfigProvider.settings.mapService || {};
    const mapServiceType = mapServiceSettings.type || 'OSM';
    const mapServiceUrl = mapServiceSettings.url;
    const mapServiceOptions = mapServiceSettings.options;

    // NIPR OSM
    // 'https://osm-{s}.geointservices.io/tiles/default/{z}/{x}/{y}.png'
    // { subdomains: '1234 }

    // NIPR WMS
    // 'https://maps.gvs.nga.mil/arcgis/services/Basemap/World_StreetMap_2D/MapServer/WmsServer?'
    // { 'layers': '0', 'version': '1.3.0' }

    if (mapServiceType === 'OSM') {
      L.tileLayer(
        ConfigProvider.settings.mapService.url,
        ConfigProvider.settings.mapService.options || {
          subdomains: '1234'
        }
      );
    } else {
      // WMS
      mapLayer = L.tileLayer.wms(
        ConfigProvider.settings.mapService.url,
        ConfigProvider.settings.mapService.options || {
          'layers': '0',
          'version': '1.3.0'
        }
      );
    }
    return mapLayer;
  }
}
