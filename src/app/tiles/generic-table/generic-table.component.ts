import { Input, Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { SpRestService } from '../../services/sp-rest.service';

import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { formatDate } from '@angular/common';

import { MatTableDataSource } from '@angular/material';
import { MatPaginator} from '@angular/material';
import { MatSort } from '@angular/material';


// Modal
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { TableItemDialogComponent } from '../../modals/table-item-dialog/table-item-dialog.component';

import { TileComponent } from '../tile/tile.component';
import { BehaviorSubject } from 'rxjs';
import { Country } from '../../model/country';
import { DataLayerService } from '../../services/data-layer.service';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css']
})

export class GenericTableComponent implements OnInit, AfterViewInit, OnDestroy, TileComponent {

  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  subscription: any;

  /*** modal start ***/
  tableItemDialogRef: MatDialogRef<TableItemDialogComponent>;

  /** modal end ***/
  // listItems: Array<any>;
  modal: any;

  /*** mat-table start ***/

  // Data source used to control the table
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

  // Fire off when row in table clicked
  onRowClicked(event: any) {

    console.log('Row clicked with event:', event);
    this.openTableItemDialog();
  }

  // Used to filter rows based on user provided input
  doFilter(value: string): void  {
    // console.log('filtering on',value);
    this.dataSource.filter = value.trim();
  }

  /*** mat-table end ***/

  constructor(private dataLayerService: DataLayerService, private dialog: MatDialog) { }

  openTableItemDialog() {

    const dialogConfig: MatDialogConfig  = new MatDialogConfig();

    dialogConfig.width = '400px';
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { name: 'Beavis', friend: 'Butthead'};


    this.tableItemDialogRef = this.dialog.open(TableItemDialogComponent, dialogConfig);

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
     // console.log('Dialog is closing - beforeClosed');
    });
  }

   ngOnInit() {

    this.dataSource.paginator = this.paginator;

    // Get columns to display
    this.matTableCols = this.settings.columns;

    console.log('this.settings', this.settings);

    // Create table display column order.  This is determined by the 'columnOrder' property of each table column entry
    // found in settings.columns
    this.columnsToDisplay = this.matTableCols.map((columnEntry) => columnEntry.columnName );

    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadTable(selectedCountry);
    });

   // this.data
  }

  loadTable(country) {
    // this.listItems = Array<any>();
    const listItems: Array<any> = Array<any>();
    this.dataLayerService.getItemsFromSource(this.settings.source, country, this.settings.columns).subscribe({
      next: results => {

        console.log('List', this.settings.source.listName, 'raw response data in table.components.ts is', results);

        // Loop over raw results
        for (const result of results) {

          // Add formated object to list of items to be returned
         listItems.push(result.processedColumns);

        } // for

        // Update the table datasource info
        this.dataSource.data = listItems;

      } // next

    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;  // TODO: this should probably be done after each time country changes
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
