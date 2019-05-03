import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import { GeospatialService } from 'src/app/services/geospatial.service';
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
      this.map = L.map('map', {
        zoomSnap: 0.05
      }).setView([6.4096, 16.7600], 3.6);

      // Add tile layers
      L.tileLayer('https://osm-{s}.geointservices.io/tiles/default/{z}/{x}/{y}.png', {
          subdomains: '1234'
      }).addTo(this.map);

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
