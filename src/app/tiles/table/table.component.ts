 import { Input, Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

import { MatTableDataSource } from '@angular/material';
import { MatPaginator} from '@angular/material';
import { MatSort } from '@angular/material';
import { TileComponent } from '../tile/tile.component';
import { Country } from '../../model/country';
import { DataLayerService } from '../../services/data-layer.service';
import { MDBModalService, MDBModalRef } from 'angular-bootstrap-md';
import { IframeModalComponent } from '../../modals/iframe-modal/iframe-modal.component';
import { ConfigProvider } from '../../providers/configProvider';
import { SourceResult, DataSource } from '../../model/dataSource';
import { DetailsModalComponent } from 'src/app/modals/details-modal/details-modal.component';
import { GeospatialService } from 'src/app/services/geospatial.service';
declare let L;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})

export class TableComponent implements OnInit, AfterViewInit, TileComponent {

  @Input() settings: any;
  @Input() country: Country;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  doLog: false; // Control component logging to console
  modalRef: MDBModalRef;
  hasGeoData: boolean;
  hasKml: boolean;
  selectedRowIndex: number;
  isSingleClick = true;

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
  rawResults: Array<SourceResult>;

  constructor(private dataLayerService: DataLayerService,
    private modalService: MDBModalService,
    private geospatialService: GeospatialService) { }

  ngOnInit() {
    this.doLog = ConfigProvider.settings.debugLog;
    this.dataSource.paginator = this.paginator;

    // Get columns to display
    this.matTableCols = this.settings.columns;
    this.columnsToDisplay = this.matTableCols.map((columnEntry) => columnEntry.columnName );

    this.loadTable(this.country);
  }

  // Fire off when row in table clicked
  onRowClicked(event: any, index: number) {
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick) {
        index = this.dataSource.paginator.pageSize * this.dataSource.paginator.pageIndex + index;
        if (!this.settings.disableModal) {
          console.log('Row clicked with event:', event);
          this.openTableItemDialog(index);
        } else if (this.hasGeoData) {
          this.geospatialService.highlightItemOnMap(L, index);
          this.selectedRowIndex = index;
        }
      }
    }, 200);
  }

  onRowDoubleClicked(event: any, index: number) {
    this.isSingleClick = false;
    index = this.dataSource.paginator.pageSize * this.dataSource.paginator.pageIndex + index;
    if (this.hasGeoData) {
      this.geospatialService.zoomToItemOnMap(L, index);
      this.selectedRowIndex = index;
    } else if (this.hasKml) {
      this.geospatialService.loadKml(this.rawResults[index].rawData.FileRef, L);
    }
  }

  // Used to filter rows based on user provided input
  doFilter(value: string): void  {
    this.dataSource.filter = value.trim();
  }

  openTableItemDialog(index) {
    const rawResult = this.rawResults[index];

    // Determine if we want to show an iframe or details modal
    if (this.settings.modal) {
      const modalTitle = this.settings.modal.titleColumn ?
        rawResult.processedColumns[this.settings.modal.titleColumn] :
        rawResult.title;


      if (this.settings.modal.type === 'details') {
        this.modalRef = this.modalService.show(DetailsModalComponent, {
          class: 'modal-lg',
          data: {
            modalTitle: modalTitle,
            sourceResult: rawResult
          }
        });
      } else {
        // Iframe
        this.modalRef = this.modalService.show(IframeModalComponent, {
          class: 'modal-lg',
          data: {
            modalTitle: modalTitle,
            settings: {
              itemUrl$: rawResult.itemUrl$,
              downloadUrl$: rawResult.downloadUrl$,
              previewUrl$: rawResult.previewUrl$,
              fullScreenUrl$: rawResult.fullScreenUrl$,
              fileType: rawResult.fileType
            }
          }
        });
      }
    }
  }

  loadTable(country) {

    const geoDataCols = [];
    // Find any geodata columns
    for (const column of this.settings.columns) {
      if (column.type === 'geo') {
        geoDataCols.push(column);
      }
      if (column.type === 'kml') {
        this.hasKml = true;
      }
    }
    this.hasGeoData = geoDataCols.length > 0;

    const listItems = Array<any>();
    this.dataLayerService.getItemsFromSource(new DataSource(this.settings.source),
      country,
      this.settings.columns).subscribe({

      next: results => {

        this.rawResults = results;

        // Loop over raw results
        let resultIndex = 0;
        const markers = [];
        for (const result of results) {

          // Add formated object to list of items to be returned
          listItems.push(result.processedColumns);

          for (const geoCol of geoDataCols) {
            // mgrsPoints.push(result.processedColumns[geoCol.name]);
            const mgrsData = result.processedColumns[geoCol.columnName];
            if (mgrsData) {
              markers.push({
                mgrsStr: mgrsData,
                identifier: resultIndex
              });
            }
          }
          resultIndex++;
        } // for

        if (this.hasGeoData && markers.length > 0) {
          this.geospatialService.addMarkersOnMap(L, markers, true, (e) => {
            this.geospatialService.updateMarkerIcon(L, e.layer);
            const rowIndex = e.layer.options.identifier;

            // switch page if needed
            const pageNumber = Math.floor(rowIndex / this.dataSource.paginator.pageSize);
            this.dataSource.paginator.pageIndex = pageNumber;
            this.paginator._changePageSize(this.dataSource.paginator.pageSize); // hack to force pager to update

            // highlight row
            this.selectedRowIndex = rowIndex;
          });
        }

        // Update the table datasource info
        this.dataSource.data = listItems;

      } // next

    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;  // TODO: this should probably be done after each time country changes
  }

}
