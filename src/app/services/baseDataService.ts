
import { Observable } from 'rxjs';
import { DataSource, Column, SourceResult } from '../model/dataSource';

export abstract class BaseDataService {
    docIconPaths = new Map<string, string>();
    ownerDocument = document.implementation.createHTMLDocument('virtual');
    newDays: 1;

    abstract getListItems(source: DataSource, filterObj?, columns?: Array<Column>): Observable<Array<SourceResult>>;

    getHtmlTextContent(htmlContent) {
        const d = this.ownerDocument.createElement( 'div' );
        d.innerHTML = htmlContent;
        return d.textContent;
    }

    replacePlaceholdersWithFieldValues(str: string, item) {
        // const matchedItems = str.match(/(?<=\{\{)(.*?)(?=\}\})/g);
        // const matchedItems = str.match(/(?<=\)/g);
        const matchedItems = str.match(/\{\{(.*?)\}\}/g) || [];
        for (const matchedItem of matchedItems) {
            str = str.replace(`${matchedItem}`, item[matchedItem.replace(/\{\{/g, '').replace(/\}\}/g, '')]);
        }

        console.log('CamlQuery in replacePlaceholdersWithFieldValues modified with', item, 'and is', str );
        return str;
    }
}
