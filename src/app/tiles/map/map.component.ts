import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
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
export class MapComponent implements OnInit, TileComponent {

  @Input() country: Country;
  @Input() settings: any;
  map: any;

  constructor(private geospatialService: GeospatialService) { }

  ngOnInit() {

    this.geospatialService.getAfricaGeoJson().subscribe(data => {
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

      L.geoJson(data, {
        filter: countryFilter.bind(this),
        onEachFeature: onEachFeature.bind(this)  // should just be one feature
      }).addTo(this.map);

      function countryFilter(feature) {
        return feature.properties.iso_a3 === this.country.countryCode3;
      }

      function onEachFeature(feature, layer) {
        this.map.fitBounds(layer.getBounds());
      }
    });
  }
}
