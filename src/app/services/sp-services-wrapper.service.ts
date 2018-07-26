import { Injectable } from '@angular/core';
import { SPServices } from 'spservices';

@Injectable({
  providedIn: 'root'
})
export class SpServicesWrapperService {

  constructor() { }

  executeQuery(options: any): Promise<{}> {
    const defaults = {
      operation: 'GetListItems',
      CAMLQuery: '<Query><Where></Where></Query>',
      async: true
    };
    const spServicesParams = $.extend({}, defaults, (options || {}));
    const promise = new Promise((resolve) => {
      $().SPServices(spServicesParams).then(function(xData) {
        const json = $(xData).SPFilterNode('z:row').SPXmlToJson({
          mapping: options.spServicesJsonMapping,
          includeAllAttrs: false
        });
        resolve(json);
      });
    });
    return promise;
  }

  executeUpdate(options: any): Promise<any> {
    const defaults = {
      operation: 'UpdateListItems',
      async: true
    };
    const spServicesParams = $.extend({}, defaults, (options || {}));
    const promise = new Promise((resolve, reject) => {
      $().SPServices(spServicesParams).then(function() {
        resolve();
      }).fail(function(error) {
        reject('Error occurred while saving your changes--' + error.statusText);
      });
    });
    return promise;
  }
}
