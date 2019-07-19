import { Component, OnInit, Input } from '@angular/core';
import { TileComponent } from '../tile/tile.component';
import { Country } from 'src/app/model/country';
import { DataLayerService } from 'src/app/services/data-layer.service';
import { DataSource } from 'src/app/model/dataSource';
import * as _ from 'lodash';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, TileComponent {
  @Input() settings: any;
  @Input() country: Country;
  chartResults: Array<any>;
  // options
  showXAxis: boolean;
  showYAxis: boolean;
  gradient: boolean;
  showLegend: boolean;
  showXAxisLabel: boolean;
  xAxisLabel: string;
  showYAxisLabel: boolean;
  yAxisLabel: string;
  colorScheme: any;
  barPadding: any;

  view: any[] = undefined;

  constructor(private dataLayerService: DataLayerService) { }

  ngOnInit() {
    // options
    this.showXAxis = this.settings.showXAxis || true;
    this.showYAxis = this.settings.showYAxis || true;
    this.gradient = this.settings.gradient || false;
    this.showLegend = this.settings.showLegend || true;
    this.showXAxisLabel = this.settings.showXAxisLabel || true;
    this.xAxisLabel = this.settings.xAxisLabel || '';
    this.showYAxisLabel = this.settings.showYAxisLabel || true;
    this.yAxisLabel = this.settings.yAxisLabel || '';
    this.barPadding = this.settings.barPadding || 2;
    this.colorScheme = {
      domain: this.settings.colorScheme || ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    };

    this.loadChart(this.country);
  }

  loadChart(country: Country) {
    this.dataLayerService.getItemsFromSource(new DataSource(this.settings.source),
    country, this.settings.columns).subscribe(arrResp => {

      if (this.settings.groupByColumn) {
        const tempResults = [];
        const groupBy = _.groupBy(arrResp, (result) => {
          return result.processedColumns[this.settings.groupByColumn];
        });
        Object.keys(groupBy).forEach(key => {
          if (Array.isArray(this.settings.valueColumn)) {
            // this assumes that the desired values are different columns in a row
            // in this case, use whatever the name is for the value column
            const newSeries = [];
            groupBy[key].forEach(result => {
              this.settings.valueColumn.forEach(col => {
                newSeries.push({
                  name: col,
                  value: result.processedColumns[col]
                });
              });
            });
            tempResults.push({
              name: key,
              series: newSeries
            });
          } else {
            // this assumes that the desired values are in different rows
            tempResults.push({
              name: key,
              series: groupBy[key] ? groupBy[key].map(result => {
                // this assumes that the desired values are in different rows
                return {
                  name: result.processedColumns[this.settings.nameColumn],
                  value: result.processedColumns[this.settings.valueColumn]
                };
              }) : []
            });
          }
        });
        this.chartResults = tempResults;
      } else {
        // Simple mapping between name and value (ex: Country & Population)
        this.chartResults = arrResp.map(result => {
          return {
            name: result.processedColumns[this.settings.nameColumn],
            value: result.processedColumns[this.settings.valueColumn]
          };
        });
      }
    });
  }
}
