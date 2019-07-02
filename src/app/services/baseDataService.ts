
import { Observable } from 'rxjs';
import { DataSource, Column, SourceResult } from '../model/dataSource';
import * as moment from 'moment';

export abstract class BaseDataService {
    docIconPaths = new Map<string, string>();
    ownerDocument = document.implementation.createHTMLDocument('virtual');
    newDays: 1;

    static replacePlaceholdersWithFieldValues(str: string, item) {
        // const matchedItems = str.match(/(?<=\{\{)(.*?)(?=\}\})/g);
        // const matchedItems = str.match(/(?<=\)/g);
        const matchedItems = str.match(/\{\{(.*?)\}\}/g) || [];
        for (const matchedItem of matchedItems) {
            str = str.replace(`${matchedItem}`, item[matchedItem.replace(/\{\{/g, '').replace(/\}\}/g, '')]);
        }

        console.log('CamlQuery in replacePlaceholdersWithFieldValues modified with', item, 'and is', str );
        return str;
    }

    abstract getListItems(source: DataSource, filterObj?, columns?: Array<Column>): Observable<Array<SourceResult>>;

    getHtmlTextContent(htmlContent) {
        const d = this.ownerDocument.createElement( 'div' );
        d.innerHTML = htmlContent;
        return d.textContent;
    }

    getIsNewOrModified(createdDate, modifiedDate) {
        let retVal = null;
        if (moment.duration(moment().diff(createdDate)).as('hours') <= 24) {
            retVal = 'New';
        } else if (moment.duration(moment().diff(modifiedDate)).as('hours') <= 24) {
            retVal = 'Updated';
        }
        return retVal;
    }


}
