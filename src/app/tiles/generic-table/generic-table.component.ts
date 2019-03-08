import { Input, Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
//import { SpListService } from '../../services/sp-list.service';
  import { SpRestService } from '../../services/sp-rest.service';

import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { formatDate } from '@angular/common';

//import { MatPaginator, TableDataSource, MatTableDataSource } from '@angular/material';
import { MatTableDataSource } from '@angular/material';
import { MatPaginator} from '@angular/material';
import { MatSort } from '@angular/material';


//Modal
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { TableItemDialogComponent } from '../../modals/table-item-dialog/table-item-dialog.component';

import { TileComponent } from '../tile/tile.component';
import { BehaviorSubject } from 'rxjs';
import { Country } from '../../model/country';

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

 /*** modal start ***/

 tableItemDialogRef: MatDialogRef<TableItemDialogComponent>;

 /** modal end ***/ 

 
  
  
  //listItems: Array<any>;

modal: any;

 
  /*** mat-table start ***/

  //Data source used to control the tabel
  dataSource  = new MatTableDataSource<any>();
  
  /* Holds the column names to be displayed in the table.  In addition, the order in which the column names appear in this array 
  determines the left to right column sequence in table
  Example - columnsToDisplay = ['Created','Title'];
  */
  columnsToDisplay: Array<string>;    
  
  /* Holds information for each column in table.
  Example entry- {columnName: "Created", displayName: "Created Date", columnOrder: 1}
  */
  matTableCols: Array<any>;

 //Fire off when row in table clicked
  onRowClicked(event:any) : void {

    console.log('Row clicked with event:', event);
    this.openTableItemDialog();
  }
  
  //Used to filter rows based on user provided input
  doFilter(value:string) : void  {
    //console.log('filtering on',value);
    this.dataSource.filter = value.trim();
  }

  /*** mat-table end ***/

  
  constructor(private spRestService: SpRestService, private dialog: MatDialog) { }

  openTableItemDialog() {

    let dialogConfig:MatDialogConfig  = new MatDialogConfig();

    dialogConfig.width = "400px";
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { name:"Beavis", friend:"Butthead"};


    this.tableItemDialogRef = this.dialog.open(TableItemDialogComponent,dialogConfig);

    this.tableItemDialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result:', result);
      this.tableItemDialogRef.close('It closed');
    });

    this.tableItemDialogRef.beforeClosed().subscribe(result => {
      console.log('Dialog result in beforeClosed:', result);
     // this.tableItemDialogRef.close('It closed');
     console.log('Dialog is closing - beforeClosed');
    });


    this.tableItemDialogRef.afterOpened().subscribe(result => {
      console.log('Dialog result in afterOpened:', result);
     // this.tableItemDialogRef.close('It closed');
     //console.log('Dialog is closing - beforeClosed');
    });
  }

   ngOnInit() {
      
    this.dataSource.paginator = this.paginator;

    //console.log('settings are',this.settings.columns);

    //Get columns to display
    this.matTableCols = this.settings.columns;

    console.log('this.settings', this.settings);

    //Create table display column order.  This is determined by the 'columnOrder' property of each table column entry found in settings.columns
    this.columnsToDisplay = this.matTableCols.sort((a,b) => (a.columnOrder > b.columnOrder) ? 1 : -1).map( (columnEntry) => { return columnEntry.columnName} );
        
   // this.listItems = Array<any>();
   let listItems: Array<any> = Array<any>();

    this.spRestService.getListItems(this.settings.source.webURL, this.settings.source.listName,
      this.settings.source.order, this.settings.source.filter, this.settings.source.rowLimit).subscribe({
        next: response => {
         
          if (this.settings.source.listType == 'links') {

            //Loop over raw results
            for (const result of response['d'].results) {

              //Object that will contain columnName:value combination for each value returned in the response 
              result.columns = {};

              for (const column of this.settings.columns) {

                result.columns[column.columnName] = "<a href='"+result[column.columnName].Url+"'>"+result[column.columnName].Description+"</a>";

              } //for

              //Add formated object to list of items to be returned
              listItems.push(result.columns);
          
            } //for

          } //if

          else {


          console.log('List', this.settings.source.listName, 'raw response data in table.components.ts is', response);

          //Loop over raw results
          for (const result of response['d'].results) {

            //Object that will contain columnName:value combination for each value returned in the response 
            result.columns = {};

            //Loop over each raw result and match the column name with its value (from response)
            for (const column of this.settings.columns) {

              result.columns[column.columnName] = (column.columnName != 'Created') ? result[column.columnName] :
                moment(result[column.columnName]).format('MM/DD/YYYY');

            } //for

            //Add formated object to list of items to be returned
           listItems.push(result.columns);
    
          } //for
        } //else

          //Update the table datasource info
          this.dataSource.data = listItems;

        } //next

    });

   // this.data
  }

  ngAfterViewInit() : void {
    this.dataSource.sort = this.sort;
  }

}