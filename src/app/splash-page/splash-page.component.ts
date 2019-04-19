import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getClosureSafeProperty } from '@angular/core/src/util/property';
import { Country } from '../model/country';
import { CountryService } from '../services/country.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { MatTabChangeEvent } from '@angular/material';
declare let L;

@Component({
  selector: 'app-splash-page',
  templateUrl: './splash-page.component.html',
  styleUrls: ['./splash-page.component.scss']
})
export class SplashPageComponent implements OnInit {
  // TODO: move these to config
  regionColorMapping = {
    'Central Africa (CA)': '#94802c',
    'East Africa (EA)': 'orange',
    'North West Africa (NWA)': 'green',
    'Southern Africa': '#94802c'
  };
  subregionMapping = {
    'Northern Africa': 'North West Africa (NWA)',
    'Western Africa': 'North West Africa (NWA)',
    'Eastern Africa': 'East Africa (EA)',
    'Middle Africa': 'Central Africa (CA)',
    'Southern Africa': 'Southern Africa'
  };
  campaignColorMapping = {
    'Campaign1': 'grey',
    'Campaign2': 'blue',
    'Campaign1,Campaign2': 'purple'
  };

  layers: any;
  regions: Array<Array<Country>>;
  campaigns: Array<Array<Country>>;
  countriesByCode: Map<string, Country>;
  geoJson: any;
  info: any;
  map: any;
  constructor(private router: Router, private httpClient: HttpClient, private countryService: CountryService) { }

  ngOnInit() {
    this.layers = {};
    const geoJsonPath = './assets/geo/africa.txt';

    this.countryService.resetCountry();
    this.countryService.getCountries().subscribe(countries => {
      this.regions = _.groupBy(countries, 'region');
      this.campaigns = _.groupBy(countries, 'campaigns');
      this.countriesByCode = new Map(countries.map(country => [country.countryCode3, country] as [string, Country]));

      this.httpClient.get(geoJsonPath).subscribe(data => {
        const self = this;
        this.map = L.map('map').setView([0.1757, 19.4238], 3);

        this.info = L.control();

        this.info.onAdd = function () {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

        // method that we will use to update the control based on feature properties passed
        this.info.update = function (props) {
          let hoverHtml = 'Hover over a country';
          if (props) {
            if (self.countriesByCode.has(props.iso_a3)) {
              const currCountry = self.countriesByCode.get(props.iso_a3);
              hoverHtml = `<b>${currCountry.title}</b><br />
                          ${currCountry.region}<br />`;
            } else {
              hoverHtml = '<b>' + props.name + '</b><br />' + self.subregionMapping[props.subregion];
            }
          }
          this._div.innerHTML = hoverHtml;
        };

        this.info.addTo(this.map);

        L.tileLayer('https://osm-{s}.geointservices.io/tiles/default/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: '1234'
        }).addTo(this.map);

        function style(feature) {
          const countryIsActive = this.countriesByCode.has(feature.properties.iso_a3);
          return {
            color: this.getRegionColor(this.subregionMapping[feature.properties.subregion]) || 'black',
            weight: 0,
            className: countryIsActive ? 'active' : 'inactive'
          };
        }

        this.geoJson = L.geoJson(data, {
          onEachFeature: function(feature, layer) {
            this.onEachFeature(feature, layer);
          }.bind(this),
          style: style.bind(this)
        }).addTo(this.map);
      });

    });
  }

  onTabChanged(event: MatTabChangeEvent) {
    const self = this;
    if (event.tab.textLabel === 'Regions') {

    } else {
      this.geoJson.eachLayer(function (layer) {
        const countryCode = layer.feature.properties.iso_a3;
        layer.setStyle({fillColor : self.getCampaignColor(countryCode) });
      });
    }
  }

  getCampaignColor(countryCode) {
    let fillColor = 'black';
    if (this.countriesByCode.has(countryCode)) {
      const campaigns = this.countriesByCode.get(countryCode).campaigns;
      fillColor = campaigns ? this.campaignColorMapping[campaigns.join(',')] : 'black';
    }
    return fillColor;
  }

  getRegionColor(region) {
    return this.regionColorMapping[region];
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
    if (this.countriesByCode.has(layer.feature.properties.iso_a3)) {
      this.router.navigate(['/country', layer.feature.properties.iso_a3]);
    }
  }

  // Pass either the click event or the iso code
  highlightFeature(e) {
    const layer = e.target || this.layers[e];

    if (this.countriesByCode.has(layer.feature.properties.iso_a3)) {
      layer.setStyle({
          fillOpacity: .5,
          weight: 3
      });
    }

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    this.info.update(layer.feature.properties).bind(this);
  }

  resetHighlight(e) {
    const layer = e.target || this.layers[e];
    this.geoJson.resetStyle(layer);
    this.info.update();
  }
}
