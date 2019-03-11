import { Input, Component, OnInit } from '@angular/core';

import { MatListModule } from '@angular/material'
import { SpRestService } from '../../services/sp-rest.service';

import * as moment from 'moment';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export class LinksComponent implements OnInit {

  @Input() settings: any;

  listItems: Array<any> = Array<any>();

   openInTab(event: any): void {

    event.preventDefault();
    let urlTarget: string  = event.target.childNodes['0'].attributes[3].nodeValue;
    window.open(urlTarget,'_blank');
    
  }

  constructor(private spRestService: SpRestService) { }

  ngOnInit() {

    this.spRestService.getListItems(this.settings.source.webURL, this.settings.source.listName,
      this.settings.source.order, this.settings.source.filter, this.settings.source.rowLimit).subscribe({
        next: response => {
                 
          console.log('List', this.settings.source.listName, 'raw response data in table.components.ts is', response, 'with settings.columns',this.settings.columns);

          //Loop over raw results
          for (const result of response['d'].results) {

            //Object that will contain columnName:value combination for each value returned in the response 
            result.columns = {};

            for (const column of this.settings.columns) {

              console.log('result item:', result, 'and current column name',column.columnName);

              //Sharepoint link list returns URL as URL { Url:, Description: } ans Comments is a first level property
              result.columns[column.columnName] = (column.columnName != 'Comments') ? result['URL'][column.columnName] : result[column.columnName];
            
            } //for

            //Add formated object to list of items to be returned
            this.listItems.push(result.columns);
        
          } //for

          console.log('links to display are',this.listItems);

      
        } //next

      });  //subscribe

  } //ngOnInit


}
