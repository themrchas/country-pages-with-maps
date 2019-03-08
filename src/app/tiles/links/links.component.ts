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

  constructor(private spRestService: SpRestService) { }

  ngOnInit() {

    this.spRestService.getListItems(this.settings.source.webURL, this.settings.source.listName,
      this.settings.source.order, this.settings.source.filter, this.settings.source.rowLimit).subscribe({
        next: response => {
                 
          console.log('List', this.settings.source.listName, 'raw response data in table.components.ts is', response);

          //Loop over raw results
          for (const result of response['d'].results) {

            //Object that will contain columnName:value combination for each value returned in the response 
            result.columns = {};

            for (const column of this.settings.columns) {

              //Sharepoint link list returns URL as URL { Url:, Description: }
              result.columns[column] = result['URL'].column;
              
              //"<a href='"+result[column.columnName].Url+"'>"+result[column.columnName].Description+"</a>";

            } //for

            //Add formated object to list of items to be returned
            this.listItems.push(result.columns);
        
          } //for

      
        } //next

      });  //subscribe

  } //ngOnInit


}
