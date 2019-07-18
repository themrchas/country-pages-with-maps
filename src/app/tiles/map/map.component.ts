import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import { GeospatialService } from 'src/app/services/geospatial.service';
import { ConfigProvider } from 'src/app/providers/configProvider';
declare let L;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy, TileComponent {

  @Input() country: Country;
  @Input() settings: any;
  map: any;

  constructor(private geospatialService: GeospatialService) { }

  // Options:
  // 1. zoom in on country (default)
  // 2. highlight country (default)
  // 3. display markers on map
  ngOnInit() {

    if (ConfigProvider.settings.mapService.type === 'OSM') {
      this.map = L.map('map', {
        zoomSnap: 0.05
      }).setView([6.4096, 16.7600], 3.6);
    } else {
      // WMS
      this.map = L.map('map', {
        zoomSnap: 0.05
      }).setView([4.9342, 18.5038], 2.6);
    }
    this.geospatialService.getTileLayer(L).addTo(this.map);
    this.geospatialService.setCurrentMap(this.map);

    if (!this.settings || (!this.settings.highlightCountry === false && !this.settings.zoomToCountry === false)) {

      const countryFilter = (feature) => {
        return feature.properties.iso_a3 === this.country.countryCode3;
      };
      const onEachFeature = (feature, layer) => {
        if (!this.settings || !this.settings.zoomToCountry === false) {
          this.map.fitBounds(layer.getBounds());
        }
      };

      this.geospatialService.getAfricaGeoJson().subscribe(data => {
        L.geoJson(data, {
          filter: countryFilter,
          style: (feature) => {
            const weight = this.settings && this.settings.highlightCountry === false ? 0 : 1;
            return {
              weight: weight
            };
          },
          onEachFeature: onEachFeature // should just be one feature
        }).addTo(this.map);
      });
    }
  }

  ngOnDestroy() {
    this.geospatialService.clearCurrentMap();
  }
}
