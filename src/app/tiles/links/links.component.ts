import { Input, Component, OnInit } from '@angular/core';

import { MatListModule } from '@angular/material'
import { SpRestService } from '../../services/sp-rest.service';

import * as moment from 'moment';
import { DataLayerService } from '../../services/data-layer.service';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

  @Input() settings: any;

  readonly defaultBackgroundColor:string ="#BEBEBE";
  readonly defaultIconUrl:string ="/assets/images/links-images/info42x42.png";

  listItems: Array<any> = Array<any>();
  columnMappings: Array<any>;

  //Open chsoen link in a new browser tab
   openInTab(event: any): void {

    event.preventDefault();
    let urlTarget: string  = event.target.childNodes['0'].attributes[3].nodeValue;
    window.open(urlTarget,'_blank');
    
  }

 

 // constructor(private spRestService: SpRestService) { }
  constructor(private dataLayerService: DataLayerService) { }

  ngOnInit() {

    this.columnMappings = this.settings.columnMappings;

    // TODO: subscribe & filter on country, process columns if needed
    this.dataLayerService.getItemsFromSource(this.settings.source).subscribe({
        next: results => {

          console.log('List', this.settings.source.listName, 'raw response data in table.components.ts is', results, 'with settings.columns',this.settings.columns);

          //Loop over raw results
          for (const result of results['d'].results) {

            //Object that will contain columnName:value combination for each value returned in the response 
            result.columns = {};

            for (const column of this.settings.columns) {

              console.log('result item:', result, 'and current column name',column.columnName);

              //Sharepoint link list returns URL as URL { Url:, Description: } and Comments,iconUrl, and backgroundColor are a first level property
             result.columns[column.columnName] = (!/Comments|iconUrl|backgroundColor/.test(column.columnName)) ? result['URL'][column.columnName] : result[column.columnName];
             
            
            } //for

            //Set default values as required
            !result.columns['iconUrl']  && (result.columns['iconUrl'] = this.defaultIconUrl);
            !result.columns['backgroundColor'] && (result.columns['backgroundColor'] = this.defaultBackgroundColor);

            //Add formated object to list of items to be returned
            this.listItems.push(result.columns);
        
          } //for

          console.log('links to display are',this.listItems);

      
        } //next
      });  // subscribe

  } // ngOnInit


}
