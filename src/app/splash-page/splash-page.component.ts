import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getClosureSafeProperty } from '@angular/core/src/util/property';
import { Country } from '../model/country';
import { CountryService } from '../services/country.service';
import { Router } from '@angular/router';
declare let L;

@Component({
  selector: 'app-splash-page',
  templateUrl: './splash-page.component.html',
  styleUrls: ['./splash-page.component.scss']
})
export class SplashPageComponent implements OnInit {
  regionColorMapping = {
    'Central Africa (CA)': 'blue',
    'East Africa (EA)': 'green',
    'North West Africa (NWA)': 'red'
  };
  layers: any;
  regions: Array<Array<Country>>;
  geoJson: any;
  info: any;
  map: any;
  constructor(private router: Router, private httpClient: HttpClient, private countryService: CountryService) { }

  ngOnInit() {
    this.layers = {};
    this.countryService.resetCountry();
    this.countryService.getRegions().subscribe(regions => this.regions = regions);
    const geoJsonPath = './assets/geo/africa.txt';

    this.httpClient.get(geoJsonPath).subscribe(data => {
      this.map = L.map('map').setView([0.1757, 19.4238], 3);

      this.info = L.control();

      this.info.onAdd = function () {
          this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
          this.update();
          return this._div;
      };

      // method that we will use to update the control based on feature properties passed
      this.info.update = function (props) {
          this._div.innerHTML = (props ? '<b>' + props.name + '</b><br />' + props.subregion
              : 'Hover over a country');
      };

      this.info.addTo(this.map);

      function getRegionColor(region) {
        let retColor;
        switch (region) {
          case 'Northern Africa': {
            retColor = 'red';
            break;
          }
          case 'Western Africa': {
            retColor = 'red';
            break;
          }
          case 'Eastern Africa': {
            retColor = 'green';
            break;
          }
          case 'Middle Africa': {
            retColor = 'blue';
            break;
          }
          case 'Southern Africa': {
            retColor = 'orange';
            break;
          }
          default: {
            retColor = 'black';
            break;
          }
        }
        return retColor;
      }

      L.tileLayer('https://osm-{s}.geointservices.io/tiles/default/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: '1234'
      }).addTo(this.map);

      function style(feature) {
        return {
          color: getRegionColor(feature.properties.subregion),
          weight: 1,
          opacity: 0.7
        };
      }

      this.geoJson = L.geoJson(data, {
        onEachFeature: function(feature, layer) {
          this.onEachFeature(feature, layer);
        }.bind(this),
        style: style
      }).addTo(this.map);
    });
  }

  onEachFeature = function(feature, layer) {
    this.layers[feature.properties.iso_a3] = layer;
    layer.on({
        mouseover: function(e) {
          this.highlightFeature(e);
        }.bind(this),
        mouseout: function(e) {
          this.resetHighlight(e);
        }.bind(this),
        click: function(e) {
          this.goToCountryPage(e);
        }.bind(this)
      });
  };

  goToCountryPage(e) {
    const layer = e.target;
    // check if country exists
    for (const region of Object.keys(this.regions)) {
      for (const country of this.regions[region]) {
        if (country.countryCode3 === layer.feature.properties.iso_a3) {
          this.router.navigate(['/country', layer.feature.properties.iso_a3]);
        }
      }
    }
  }

  // Pass either the click event or the iso code
  highlightFeature(e) {
    const layer = e.target || this.layers[e];

    layer.setStyle({
        fillOpacity: .5,
        weight: 3
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    this.info.update(layer.feature.properties);
  }

  resetHighlight(e) {
    const layer = e.target || this.layers[e];
    this.geoJson.resetStyle(layer);
    this.info.update();
  }
}
