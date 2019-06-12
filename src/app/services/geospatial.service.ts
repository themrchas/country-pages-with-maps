import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class GeospatialService {
  private africaGeoJson: Observable<any>;
  private geoJsonPath = './assets/geo/africa.txt';
  public currentMap = new BehaviorSubject<any>(null);

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

    // NIPR OSM
    // 'https://osm-{s}.geointservices.io/tiles/default/{z}/{x}/{y}.png'
    // { subdomains: '1234 }

    // NIPR WMS
    // 'https://maps.gvs.nga.mil/arcgis/services/Basemap/World_StreetMap_2D/MapServer/WmsServer?'
    // { 'layers': '0', 'version': '1.3.0' }

    if (mapServiceType === 'OSM') {
      mapLayer = L.tileLayer(
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

  setCurrentMap(map) {
    this.currentMap.next(map);
  }

  clearCurrentMap() {
    this.currentMap.next(null);
  }

  getMarkerIcon(L) {
    return L.divIcon({html: '<div><div class="pin"></div><div class="pulse"></div></div>'});
  }

  getHighlightedIcon(L) {
    return L.divIcon({html: '<div><div class="pin red"></div><div class="pulse"></div></div>'});
  }
}
