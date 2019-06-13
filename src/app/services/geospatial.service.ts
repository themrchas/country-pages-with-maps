import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';
import * as mgrs from 'mgrs';

@Injectable({
  providedIn: 'root'
})
export class GeospatialService {
  private africaGeoJson: Observable<any>;
  private geoJsonPath = './assets/geo/africa.txt';
  private markerDict = {};
  private selectedMapMarker: any;
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

  highlightItemOnMap(L, identifier) {
    const mapMarker = this.markerDict[identifier];
    mapMarker.openPopup();
    this.updateMarkerIcon(L, mapMarker);
  }

  updateMarkerIcon(L, marker) {
    if (this.selectedMapMarker) {
      this.selectedMapMarker.setIcon(this.getMarkerIcon(L));
      this.selectedMapMarker.setZIndexOffset(0);
    }
    marker.setIcon(this.getHighlightedIcon(L));
    marker.setZIndexOffset(300);
    this.selectedMapMarker = marker;
  }

  addMarkersOnMap(L, markers: Array<any>, zoomToBounds, handleMarkerClick) {
    // Make sure map has been initialized before adding markers
    if (!this.currentMap.value) {
      this.currentMap.subscribe(map => {
        this._addMarkersOnMap(L, markers, zoomToBounds, handleMarkerClick);
      });
    } else {
      this._addMarkersOnMap(L, markers, zoomToBounds, handleMarkerClick);
    }
  }

  _addMarkersOnMap(L, markers: Array<any>, zoomToBounds, handleMarkerClick) {
    const markerIcon = this.getMarkerIcon(L);

    const leafletMarkers = markers.map(marker => {
      return L.marker(mgrs.toPoint(marker.mgrsStr),
        { icon: markerIcon, riseOnHover: true, identifier: marker.identifier });
    });

    const group = L.featureGroup(leafletMarkers)
      .on('click', handleMarkerClick)
      .addTo(this.currentMap.value);

    group.eachLayer(layer => {
      layer.bindPopup('<div>Test</div>');
      this.markerDict['' + layer.options.identifier] = layer; // Map row index to marker to retrieve later
    });

    // zoom to bounds
    this.currentMap.value.fitBounds(group.getBounds(), { padding: [50, 50]});
  }
}
