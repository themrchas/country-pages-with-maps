import { Input, Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DataLayerService } from '../../services/data-layer.service';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

  @Input() settings: any;

  listItems: Array<any> = Array<any>();
  columnMappings: Array<any>;

  constructor(private dataLayerService: DataLayerService) { }

  ngOnInit() {

    this.columnMappings = this.settings.columnMappings;

    // TODO: subscribe & filter on country, process columns if needed
    this.dataLayerService.getItemsFromSource(this.settings.source).subscribe({
        next: results => {

          console.log('List', this.settings.source.listName, 'raw response data in table.components.ts is',
            results, 'with settings.columns', this.settings.columns);

          this.listItems = results;

          console.log('links to display are', this.listItems);

        } // next

      });  // subscribe

  } // ngOnInit


}
