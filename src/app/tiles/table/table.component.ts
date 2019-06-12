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
import * as mgrs from 'mgrs';
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
  map: any; // reference to map tile, if table contains geodata
  markerDict = {};
  selectedMapMarker: any;
  selectedRowIndex: number;

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
    index = this.dataSource.paginator.pageSize * this.dataSource.paginator.pageIndex + index;
    if (!this.settings.disableModal) {
      console.log('Row clicked with event:', event);
      this.openTableItemDialog(index);
    } else if (this.hasGeoData) {
      this.highlightRowOnMap(index);
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
    const mgrsPoints = [];
    // Find any geodata columns
    for (const column of this.settings.columns) {
      if (column.type === 'geo') {
        geoDataCols.push(column);
      }
    }
    this.hasGeoData = geoDataCols.length > 0;
    const markerIcon = this.geospatialService.getMarkerIcon(L);

    // this.listItems = Array<any>();
    const listItems: Array<any> = Array<any>();
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

              /* const marker = L.marker(mgrs.toPoint(mgrsData), { icon: markerIcon, riseOnHover: true, rowIndex: resultIndex })
                .addTo(this.map)
                .on('click', this.handleMarkerClick.bind(this));
              marker.bindPopup('<div>Test</div>'); */
              const marker = L.marker(mgrs.toPoint(mgrsData), { icon: markerIcon, riseOnHover: true, rowIndex: resultIndex });
              markers.push(marker);
            }
          }
          resultIndex++;
        } // for

        this.map = this.geospatialService.currentMap.value;
        if (!this.map) {
          this.geospatialService.currentMap.subscribe(map => {
            this.map = map;
            this.addMarkersOnMap(markers);
          });
        } else {
          this.addMarkersOnMap(markers);
        }

        // Update the table datasource info
        this.dataSource.data = listItems;

      } // next

    });
  }

  addMarkersOnMap(markers: Array<any>) {
    if (markers.length > 0  && this.map) {
      const group = L.featureGroup(markers)
      .on('click', this.handleMarkerClick.bind(this))
      .addTo(this.map);

      group.eachLayer(layer => {
        layer.bindPopup('<div>Test</div>');
        this.markerDict['' + layer.options.rowIndex] = layer; // Map row index to marker to retrieve later
      });

      // zoom to bounds
      this.map.fitBounds(group.getBounds(), { padding: [50, 50]});
    }
  }

  highlightRowOnMap(index) {
    const mapMarker = this.markerDict[index];
    mapMarker.openPopup();
    this.updateMarkerIcon(mapMarker);
    this.selectedRowIndex = index;
  }

  handleMarkerClick(e) {
    this.updateMarkerIcon(e.layer);
    const rowIndex = e.layer.options.rowIndex;

    // switch page if needed
    const pageNumber = Math.floor(rowIndex / this.dataSource.paginator.pageSize);
    this.dataSource.paginator.pageIndex = pageNumber;
    this.paginator._changePageSize(this.dataSource.paginator.pageSize); // hack to force pager to update

    // highlight row
    this.selectedRowIndex = rowIndex;
  }

  updateMarkerIcon(marker) {
    if (this.selectedMapMarker) {
      this.selectedMapMarker.setIcon(this.geospatialService.getMarkerIcon(L));
      this.selectedMapMarker.setZIndexOffset(0);
    }
    marker.setIcon(this.geospatialService.getHighlightedIcon(L));
    marker.setZIndexOffset(300);
    this.selectedMapMarker = marker;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;  // TODO: this should probably be done after each time country changes
  }

}
