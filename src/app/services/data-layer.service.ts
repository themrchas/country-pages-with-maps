import { Injectable } from '@angular/core';
import { SpRestService } from './sp-rest.service';
import { DataSource } from '../model/dataSource';
import { ConfigProvider } from '../providers/configProvider';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataLayerService {

  constructor(private spRestService: SpRestService) {}

  getItemsFromSource(source: DataSource, filterObj?, columns?): Observable<Array<any>>  {
    let asyncRequest: Observable<Object>;
    let filter = source.filter;
    let camlQuery = source.camlQuery;

    if (filterObj) {
      camlQuery = source.camlQuery ?
          this.replacePlaceholdersWithFieldValues(source.camlQuery, filterObj) : source.camlQuery;
      filter = source.filter ?
          this.replacePlaceholdersWithFieldValues(source.filter, filterObj) : source.filter;
    }

    if (source.camlQuery) {
      const viewXml = JSON.stringify({ViewXml: `${camlQuery}`});
      asyncRequest = this.spRestService.getListItemsCamlQuery(source.listWeb, source.listName, viewXml,
        ConfigProvider.requestDigest);
    } else {
      if (source.type === 'docLibrary') {
        // TODO: support filtering & camlQuery
        asyncRequest = this.spRestService.getDocuments(source.listWeb, source.listName);
      } else {
        asyncRequest = this.spRestService.getListItems(source.listWeb, source.listName, source.order, filter,
          source.select, source.expand, source.rowLimit);
      }
    }
    return asyncRequest.pipe(map(resp => {
      let retVal = null;
      if (resp && resp['d'] && resp['d'].results) {
        retVal = resp['d'].results;
      }
      return retVal;
    }));
  }

  replacePlaceholdersWithFieldValues(str: string, item) {
      // const matchedItems = str.match(/(?<=\{\{)(.*?)(?=\}\})/g);
      // const matchedItems = str.match(/(?<=\)/g);
      const matchedItems = str.match(/\{\{(.*?)\}\}/g) || [];
      for (const matchedItem of matchedItems) {
          str = str.replace(`${matchedItem}`, item[matchedItem.replace(/\{\{/g, '').replace(/\}\}/g, '')]);
      }
      return str;
  }

}
