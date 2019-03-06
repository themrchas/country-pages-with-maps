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

 // @ViewChild(MatPagintor) pagintor: MatPaginator;

 //modal
  tableItemDialogRef: MatDialogRef<TableItemDialogComponent>;
  
  listItems: Array<any>;

 parsedListItems: Observable<Array<any>>;


 dataSource  = new MatTableDataSource<any>();

modal: any;

 // dataSource = new MatTableDataSource<Observable<Array<any>>>(this.parsedListItems);



  /*** mat-table */
  columnsToDisplay = ['Title','Created'];

  //{columnName: "Title", displayName: "Title"}
  matTableCols: Array<any>;
/*
testListItems: Array<any> = [

  {title:"Entry One", Created:"12/1/2018"},
  {title:"Entry Two", Created:"1/1/2019"}

]; */

onRowClicked(event:any) : void {

  console.log('Row clicked with event:', event);
  this.openTableItemDialog();
}

doFilter(value:string) : void  {
  console.log('filtering on',value);
  this.dataSource.filter = value.trim();
}
/****************************/


  formatDate(strDate:string): void {

    console.log('passed date', strDate,'converted date',moment(strDate).format('MM/DD/YYYY'));
  }
  
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

    console.log('settings are',this.settings.columns);

    //Get columns to display
    this.matTableCols = this.settings.columns;
    


    this.listItems = Array<any>();
    this.spRestService.getListItems(this.settings.source.webURL, this.settings.source.listName,
      this.settings.source.order, this.settings.source.filter, this.settings.source.rowLimit).subscribe({
      next: response => {
        console.log('SampleList in table.components.ts is', response);

        //Loop over raw resultsn
        for (const result of response['d'].results) {

       //   result.columns = [];
       result.columns = {};
          console.log('processing result with value',result);
          for (const column of this.settings.columns) {
          //  console.log('pushing', column.columnName,'with value',result[column.columnName]);
          //  result.columns.push(result[column.columnName]);
          
          //  result.columns[column.columnName] = result[column.columnName]
          result.columns[column.columnName] = (column.columnName != 'Created') ? result[column.columnName] : 
                                                                    moment(result[column.columnName]).format('MM/DD/YYYY');
            
          }
          this.listItems.push(result.columns);
          this.formatDate(result['Created']);

          console.log('listItems is',this.listItems);

        //  this.parsedListItems = of(this.listItems);
        this.parsedListItems = of(this.listItems);

        this.dataSource.data = this.listItems;
        }
      }
    });

   // this.data
  }

  ngAfterViewInit() : void {
    this.dataSource.sort = this.sort;
  }

}