import { Injectable } from '@angular/core';
import { SpRestService } from './sp-rest.service';
import { DataSource, Column, SourceResult, SourceServiceType } from '../model/dataSource';
import { Observable, of } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {
  
  doLog: boolean = true;
 
  constructor(private spRestService: SpRestService) {
    
     this.doLog = ConfigProvider.settings.debugLog;
  }

  getItemsFromSource(source: DataSource, filterObj?, columns?: Array<Column>): Observable<Array<SourceResult>>  {
    let asyncRequest: Observable<Array<SourceResult>>;

    this.doLog && console.log('\n ----> source passed to  getItemsFromSource in data-layer,service is ', source);
    this.doLog && console.log(' filterObj is ', filterObj);
    this.doLog && console.log('columns are <----', columns,'\n');

    if (source.service === SourceServiceType.SHAREPOINT) {
      asyncRequest = this.spRestService.getListItems(source, filterObj, columns);
    } else if (source.service === SourceServiceType.CIDNE) {
      // TO DO
    }
    return asyncRequest;
  }
}
