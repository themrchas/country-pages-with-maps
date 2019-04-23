import { Component, OnInit, Input } from '@angular/core';
import { ConfigProvider } from '../../providers/configProvider';
import { from } from 'rxjs';
import { DataLayerService } from '../../services/data-layer.service';
import { Country } from '../../model/country';
import { mergeMap } from 'rxjs/operators';
import { DataSource } from 'src/app/model/dataSource';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  @Input() settings: any;
  @Input() country: Country;

  doLog: boolean = true;

  // Items read from links list
  listItems: Array<any> = Array<any>();

  constructor(private dataLayerService: DataLayerService) {}

  ngOnInit() {
   // this.doLog = ConfigProvider.settings.debugLog;
    this.doLog && console.log('****Starting processing on charts component in ngOnInit*****');
    this.loadChartData(this.country);
    
} // ngOnInit


loadChartData(country): void {
 

  this.doLog && console.log('----chart.component.ts with country',country,'and settings.sources',this.settings.sources,'settings.columns',this.settings.columns);

  from(this.settings.sources).pipe(mergeMap(source => {
    return this.dataLayerService.getItemsFromSource(new DataSource(source), country, this.settings.columns);
  })).subscribe({
    next: results => {

      // Loop over raw results returned from list query
     for (const result of results) {

        // Object that will contain columnName:value combination for each value returned in the response
        const columns = {};

        for (const column of this.settings.columns) {

          this.doLog && console.log('result processedColumns for item:', result, 'and current column name', column.columnName);
          columns[column.columnName] = result.processedColumns[column.columnName];
  
        } // for

       
        // Add formated object to list of items to be returned
        this.listItems.push(columns);

      } // for

      this.doLog && console.log('Chart data to display is', this.listItems);
    } // next
  });  // subscribe

}


}
