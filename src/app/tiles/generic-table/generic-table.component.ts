import { Input, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { SpListService } from '../../services/sp-list.service';
  import { SpRestService } from '../../services/sp-rest.service';

import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { formatDate } from '@angular/common';

// import { MatPaginator, TableDataSource, MatTableDataSource } from '@angular/material';
import { MatTableDataSource } from '@angular/material';
import { MatPaginator} from '@angular/material';
import { MatSort } from '@angular/material';
import { MatFormField } from '@angular/material';

import { TileComponent } from '../tile/tile.component';
import { BehaviorSubject } from 'rxjs';
import { Country } from '../../model/country';
import { DataLayerService } from '../../services/data-layer.service';
import { DataSource } from '../../model/dataSource';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css']
})

export class GenericTableComponent implements OnInit, AfterViewInit, TileComponent {

  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

 // @ViewChild(MatPagintor) pagintor: MatPaginator;
  listItems: Array<any>;

 parsedListItems: Observable<Array<any>>;


 dataSource  = new MatTableDataSource<any>();


 // dataSource = new MatTableDataSource<Observable<Array<any>>>(this.parsedListItems);



  /*** mat-table */
  columnsToDisplay = ['Title', 'Created'];


testListItems: Array<any> = [

  {title: 'Entry One', Created: '12/1/2018'},
  {title: 'Entry Two', Created: '1/1/2019'}

];

onRowClicked(event: any): void {

  console.log('Row clicked with event:', event);
}

doFilter(value: string): void  {
  console.log('filtering on', value);
  this.dataSource.filter = value.trim();
}
/****************************/




  formatDate(strDate: string): void {

    console.log('passed date', strDate, 'converted date', moment(strDate).format('MM/DD/YYYY'));
  }

  constructor(private dataLayerService: DataLayerService) { }

  ngOnInit() {


    this.dataSource.paginator = this.paginator;



    this.listItems = Array<any>();
    this.dataLayerService.getItemsFromSource(new DataSource(this.settings.source)).subscribe({
      next: response => {
        console.log('SampleList in table.components.ts is', response);

        // Loop over raw resultsn
        for (const result of response) {

       //   result.columns = [];
       result.columns = {};
          console.log('processing result with value', result);
          for (const column of this.settings.columns) {
          //  console.log('pushing', column.columnName,'with value',result[column.columnName]);
          //  result.columns.push(result[column.columnName]);

          //  result.columns[column.columnName] = result[column.columnName]
          result.columns[column.columnName] = (column.columnName !== 'Created') ? result[column.columnName] :
                                                                    moment(result[column.columnName]).format('MM/DD/YYYY');

          }
          this.listItems.push(result.columns);
          this.formatDate(result['Created']);

          console.log('listItems is', this.listItems);

        //  this.parsedListItems = of(this.listItems);
        this.parsedListItems = of(this.listItems);

        this.dataSource.data = this.listItems;
        }
      }
    });

   // this.data
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

}
