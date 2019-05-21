import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country } from '../model/country';
import { CountryService } from '../services/country.service';
import { Router } from '@angular/router';
import union from '@turf/union';
import * as _ from 'lodash';
import { MatTabChangeEvent } from '@angular/material';
import { ConfigProvider } from '../providers/configProvider';
import { GeospatialService } from '../services/geospatial.service';
declare let L;

@Component({
  selector: 'app-splash-page',
  templateUrl: './splash-page.component.html',
  styleUrls: ['./splash-page.component.scss']
})
export class SplashPageComponent implements OnInit {

  countryLayersDict: any;  // country code to layer
  regionLayersDict: any; // region name to layer
  campaignLayersDict: any; // campaign name to layer

  countryLayerGroup: any;
  regionLayerGroup: any;
  campaignLayerGroup: any;

  regions: any;  // countries grouped by region
  campaigns: any; // countries grouped by campaign
  countries: Array<Country>; // flat countries array
  countriesByCode: Map<string, Country>;  // Map country code to country

  regionColorMapping: any;
  campaignColorMapping: any;
  subregionMapping: any; // map geoJson regions to Region MM field

  selectedTab: string;

  info: any;
  map: any;
  geoData: any;

  constructor(private router: Router,
    private countryService: CountryService,
    private geospatialService: GeospatialService) { }

  ngOnInit() {
    this.countryLayersDict = {};

    this.regionColorMapping = ConfigProvider.settings.country.regionColorMapping;
    this.campaignColorMapping = ConfigProvider.settings.country.campaignColorMapping;
    this.subregionMapping = ConfigProvider.settings.country.subregionMapping;

    this.countryService.resetCountry();
    this.countryService.getCountries().subscribe(countries => {
      this.countries = countries;
      this.regions = _.groupBy(this.countries, 'region');

      // Group by Campaigns.  For countries that have multiple campaigns, add them once per group
      const campObj = {};
      this.countries.forEach(country => {
        if (country.campaigns) {
          country.campaigns.forEach(campaign => {
            if (!campObj[campaign]) {
              campObj[campaign] = [country];
            } else {
              campObj[campaign].push(country);
            }
          });
        }
      });
      this.campaigns = campObj;
      this.countriesByCode = new Map(countries.map(country => [country.countryCode3, country] as [string, Country]));

      // Get the Africa GeoJSON
      this.geospatialService.getAfricaGeoJson().subscribe(data => {
        const self = this;
        this.geoData = data;

        if (ConfigProvider.settings.mapService.type === 'OSM') {
          this.map = L.map('map', {
            zoomSnap: 0.05
          }).setView([6.4096, 16.7600], 3.6);
        } else {
          // WMS
          this.map = L.map('map', {
            crs: L.CRS.EPSG4326,
            zoomSnap: 0.05
          }).setView([4.9342, 18.5038], 2.6);
        }

        // Create the hover info box
        this.info = L.control();

        this.info.onAdd = function () {
            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
            this.update();
            return this._div;
        };

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

        // Add tile layer
        this.geospatialService.getTileLayer(L).addTo(this.map);

        // Styling per country layer
        function style(feature) {
          const countryIsActive = this.countriesByCode.has(feature.properties.iso_a3);
          return {
            color: this.getRegionColor(this.subregionMapping[feature.properties.subregion]) || 'black',
            weight: 0,
            className: countryIsActive ? 'active' : 'inactive'
          };
        }

        // GeoJSON layer for all the countries
        this.countryLayerGroup = L.geoJson(data, {
          onEachFeature: function(feature, layer) {
            this.onEachFeature(feature, layer);
          }.bind(this),
          style: style.bind(self)
        });

        this.map.addLayer(this.countryLayerGroup);
        this.addRegionsGeoJson(data);
      });

    });
  }

  getUnifiedGeoJson(polyList, properties) {
    let unionTemp;
    let i = 0;
    for (const key of Object.keys(polyList)) {
      const polyItem = polyList[key];
      if (i === 0) {
        unionTemp = polyItem.toGeoJSON();
      } else {
        unionTemp = union(unionTemp, polyItem.toGeoJSON());
      }
      i++;
    }
    unionTemp.properties = properties;
    return unionTemp;
  }

  addRegionsGeoJson(geoJson) {
    const self = this;

    // Styling for region layer
    function regionStyle(feature) {
      return {
        color: this.getRegionColor(feature.properties.region),
        fillOpacity: 0,
        weight: 3
      };
    }

    // Merge regions
    if (this.regionLayerGroup) {
      this.map.addLayer(this.regionLayerGroup);
    } else {
      this.regionLayersDict = {};
      const regionLayers = [];
      Object.keys(this.regions).forEach(regionKey => {

        // Get the subregion from the feature, determine if the subregion matches current region key
        const countryLayers = geoJson.features.filter(feature => {
          return this.subregionMapping[feature.properties.subregion] === regionKey;
        }).map(countryFeature => {
          return this.countryLayersDict[countryFeature.properties.iso_a3];
        });

        const layer = L.geoJson(this.getUnifiedGeoJson(countryLayers, {region: regionKey }), {
          style: regionStyle.bind(self)
        });
        this.regionLayersDict[regionKey] = layer;
        regionLayers.push(layer);
      });
      this.regionLayerGroup = L.layerGroup(regionLayers);
      this.map.addLayer(this.regionLayerGroup);
    }

    // Need to bring the country layer to the front, otherwise the region geoJson layer
    // will be on top and will hide country hover effects
    this.countryLayerGroup.bringToFront();
  }

  removeRegionsGeoJson() {
    if (this.regionLayerGroup) {
      this.map.removeLayer(this.regionLayerGroup);
    }
  }

  addCampaignsGeoJson() {
    const self = this;

    // Styling for region layer
    function campaignStyle(feature) {
      return {
        color: this.campaignColorMapping[feature.properties.campaign],
        fillOpacity: 0,
        weight: 3
      };
    }

    // Merge Campaigns
    if (this.campaignLayerGroup) {
      this.map.addLayer(this.campaignLayerGroup);
    } else {
      this.campaignLayersDict = {};
      const campaignLayers = [];
      Object.keys(this.campaigns).forEach(campaignKey => {
        const countryLayers = this.campaigns[campaignKey].map(country => {
          return this.countryLayersDict[country.countryCode3];
        });
        const layer = L.geoJson(this.getUnifiedGeoJson(countryLayers, { campaign: campaignKey }), {
          style: campaignStyle.bind(self)
        });
        this.campaignLayersDict[campaignKey] = layer;
        campaignLayers.push(layer);
      });
      this.campaignLayerGroup = L.layerGroup(campaignLayers);
      this.map.addLayer(this.campaignLayerGroup);
    }

    // Need countries to always be top layer for hover effect & click to work
    this.countryLayerGroup.bringToFront();
  }

  removeCampaignsGeoJson() {
    if (this.campaignLayerGroup) {
      this.map.removeLayer(this.campaignLayerGroup);
    }
  }

  onTabChanged(event: MatTabChangeEvent) {
    const self = this;
    this.selectedTab = event.tab.textLabel;
    if (event.tab.textLabel === 'Regions') {
      this.removeCampaignsGeoJson();
      this.addRegionsGeoJson(this.geoData);
      this.countryLayerGroup.eachLayer(function (layer) {
        self.countryLayerGroup.resetStyle(layer);
      });
    } else if (event.tab.textLabel === 'Campaigns') {
      this.removeRegionsGeoJson();
      this.addCampaignsGeoJson();
      this.countryLayerGroup.eachLayer(function (layer) {
        const countryCode = layer.feature.properties.iso_a3;
        const color = self.getCampaignColor(countryCode);
        layer.setStyle({
          fillColor : color,
          color: color
        });
      });
    } else {
      this.removeRegionsGeoJson();
      this.removeCampaignsGeoJson();
      this.countryLayerGroup.eachLayer(function (layer) {
        layer.setStyle({
          fillColor : '#94802c',
          color: '#94802c'
        });
      });
    }
  }

  getCampaignColor(countryCode) {
    let fillColor = '#94802c';
    if (this.countriesByCode.has(countryCode)) {
      const campaigns = this.countriesByCode.get(countryCode).campaigns;
      fillColor = campaigns ? this.campaignColorMapping[campaigns.join(',')] : '#94802c';
    }
    return fillColor;
  }

  getRegionColor(region) {
    return this.regionColorMapping[region];
  }

  onEachFeature = function(feature, layer) {
    this.countryLayersDict[feature.properties.iso_a3] = layer;
    layer.on({
      mouseover: function(e) {
        this.highlightCountry(e);
      }.bind(this),
      mouseout: function(e) {
        this.resetHighlightCountry(e);
      }.bind(this),
      click: function(e) {
        console.log(this.map.getCenter());
        this.goToCountryPage(e);
      }.bind(this)
    });
  };

  goToCountryPage(e) {
    const layer = e.target;
    // check if country exists
    if (this.countriesByCode.has(layer.feature.properties.iso_a3)) {
      this.router.navigate(['/country', layer.feature.properties.iso_a3],
        { queryParamsHandling: 'preserve'});
    }
  }

  highlightRegion(region) {
    const layer = this.regionLayersDict[region];
    layer.setStyle({
      fillOpacity: .5
    });
    layer.bringToFront();
  }

  resetHighlightRegion() {
    this.regionLayerGroup.eachLayer(function(layer) {
      layer.setStyle({
        fillOpacity: .2
      });
    });
    this.countryLayerGroup.bringToFront();
  }

  highlightCampaign(campaign) {
    const layer = this.campaignLayersDict[campaign];
    layer.setStyle({
      fillOpacity: .5
    });
    layer.bringToFront();
  }

  resetHighlightCampaign() {
    this.campaignLayerGroup.eachLayer(function(layer) {
      layer.setStyle({
        fillOpacity: .2
      });
    });
    this.countryLayerGroup.bringToFront();
  }

  // Pass either the click event or the iso code
  highlightCountry(e) {
    const layer = e.target || this.countryLayersDict[e];

    if (this.countriesByCode.has(layer.feature.properties.iso_a3)) {
      const country = this.countriesByCode.get(layer.feature.properties.iso_a3);
      // Only highlight campaign countries if Campaigns tab is selected
      if (this.selectedTab !== 'Campaigns' || country.campaigns) {
        layer.setStyle({
            fillOpacity: .5,
            weight: 3
        });
      }
    }

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    this.info.update(layer.feature.properties);
  }

  resetHighlightCountry(e) {
    const layer = e.target || this.countryLayersDict[e];
    layer.setStyle({
      fillOpacity: .2,
      weight: 0
    });
    this.info.update();
  }
}
