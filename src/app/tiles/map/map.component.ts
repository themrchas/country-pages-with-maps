import { Component, NgZone, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';
import { Country } from '../../model/country';
import { TileComponent } from '../tile/tile.component';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy, TileComponent {
  private map: am4maps.MapChart;
  @Input() country: BehaviorSubject<Country>;
  @Input() settings: any;
  subscription: any;
  constructor(private zone: NgZone) { }

  ngOnInit() {
    this.subscription = this.country.subscribe(country => {
        const self = this;
        this.zone.runOutsideAngular(() => {
          const map = am4core.create('mapdiv', am4maps.MapChart);
          const polygonSeries = new am4maps.MapPolygonSeries();
          polygonSeries.useGeodata = true;
          polygonSeries.exclude = ['AQ'];
          map.series.push(polygonSeries);
          map.geodata = am4geodata_worldHigh;

          const polygonTemplate = polygonSeries.mapPolygons.template;
          polygonTemplate.tooltipText = '{name}';
          polygonTemplate.fill = am4core.color('#74B266');

          // Create active state
          const as = polygonTemplate.states.create('active');
          as.properties.fill = am4core.color('#7B3625');

          // Setting map's initial zoom
          map.homeZoomLevel = 5;
          map.homeGeoPoint = {
            latitude: 7,
            longitude: 20
          };

          map.events.on('ready', function(ev) {
            const zoomCountry = polygonSeries.getPolygonById(country.countryCode2);

            // Pre-zoom
            map.zoomToMapObject(zoomCountry);

            // Set active state
            setTimeout(function() {
              zoomCountry.isActive = true;
            }, 1000);
          });
          this.map = map;
        });
    });
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.zone.runOutsideAngular(() => {
      if (this.map) {
        this.map.dispose();
      }
    });
  }
}
