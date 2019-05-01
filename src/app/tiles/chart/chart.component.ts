import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConfigProvider } from '../../providers/configProvider';
import { DataLayerService } from '../../services/data-layer.service';
import { Country } from '../../model/country';
import { mergeMap } from 'rxjs/operators';
import { DataSource } from 'src/app/model/dataSource';



@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  @Input() settings: any;
  @Input() country: Country;

  doLog: boolean;

  // True once list data has been loaded and parsed; ensures the canvas is not drawn without data
  dataReady = false;

  // Items read from SharePoint list
  listItems: Array<any> = Array<any>();

  // ng2 charts objects
  public lineChartData: Array<any> = [];
  public lineChartLabels: Array<any> = [];
  public lineChartType = 'line';

  /*** Static Test Data ***

  public lineChartData:Array<any> = [
  {data: [65, 59, 80, 81, 56, 55, 40], label: 'World' }
 ];

 public lineChartLabels:Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

/*** End Test Data ***/


// More n2 chart objects
  public lineChartColors: Array<any> = [
    {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: 'gray',
      borderDash: [],
      lineTension: 0.6,
      showLine: true,
      pointRadius: 5,
      fill: false,
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)',
      pointHoverRadius: 7
    } ];

    public lineChartOptions: any = {
      responsive: true

    };



  constructor(private dataLayerService: DataLayerService) {}

  ngOnInit() {

   this.doLog = ConfigProvider.settings.debugLog;
   this.doLog && console.log('****Starting processing on charts component in ngOnInit*****');
   this.loadChartData(this.country);

} // ngOnInit


loadChartData(country): void {

  this.doLog && console.log('----chart.component.ts with country', country,
    'and settings.sources', this.settings.source, 'settings.columns', this.settings.columns);

  // Data to be displayed in raw form
  const parsedLineChartData: Array<any> = [];

  // Name of column data to use as x-axis data
  const xAxisColumnName = this.settings.source.xAxisColumnName;

  // Chart label/title
  const chartLabel = this.settings.source.chartLabel;

  // Set axes names and rescale y-axis as required
  this.lineChartOptions.scales  = {};
  this.lineChartOptions.scales.xAxes = [  { scaleLabel: { display: true, labelString: this.settings.source.xAxisLabel} } ];
  this.lineChartOptions.scales.yAxes =  [   { scaleLabel: { display: true, labelString: this.settings.source.yAxisLabel},
    ticks: { beginAtZero: this.settings.source.scaleYAtOrigin } }   ] ;


  this.dataLayerService.getItemsFromSource(new DataSource(this.settings.source), country, this.settings.columns)
    .subscribe({
      next: results => {

        // Loop over raw results returned from list query
        for (const result of results) {

          // Object that will contain columnName:value combination for each value returned in the response
          const columns = {};

          for (const column of this.settings.columns) {

            this.doLog && console.log('result processedColumns for item:', result, 'and current column name', column.columnName);
            columns[column.columnName] = result.processedColumns[column.columnName];

            // Save data based on whether column is x or y
            column.columnName === xAxisColumnName ? this.lineChartLabels.push(result.processedColumns[column.columnName])
              : parsedLineChartData.push(result.processedColumns[column.columnName]);

          } // for

          // Add formated 'columns' object to list of items to be returned
          this.listItems.push(columns);

        } // for


        this.doLog && console.log('Chart data to display is', this.listItems);
        this.lineChartData.push({ 'data': parsedLineChartData, 'label': chartLabel });
        this.doLog && console.log('charts.js data is lineChartLabels:', this.lineChartLabels, 'lineChartData:', this.lineChartData);

        // Data reeady to be displayed
        this.dataReady = true;

      } // next
  });  // subscribe

}


}
