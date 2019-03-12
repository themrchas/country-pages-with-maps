import * as moment from 'moment';

export class DataSource {

    listName: string;
    listWeb: string;
    displayName?: string;
    url?: string;
    displayForm?: string;
    dateField?: string;
    type?: string;
    contentField?: string;
    camlQuery?: string;
    select?: string;
    expand?: string;
    filter?: string;
    order?: string;
    rowLimit?: number;
    dateFilter?: any;

    // For document library sources, the folder path should be used as the listName
    constructor(json) {
        this.listName = json.listName;
        this.listWeb = json.listWeb;
        this.displayName = json.displayName;
        this.url = json.url;
        this.displayForm = json.displayForm;
        this.type = json.type;
        this.contentField = json.contentField;
        this.camlQuery = json.camlQuery;
        this.select = json.select;
        this.expand = json.expand;
        this.filter = json.filter;
        this.order = json.order;
        this.rowLimit = json.rowLimit;

        if (json.dateFilter) {
            if (json.dateFilter.startDate) {
                let startDate = json.dateFilter.startDate.toUpperCase() === 'TODAY' ? moment() :
                    moment(json.dateFilter.startDate);
                startDate = startDate.startOf('day').add(json.dateFilter.startDateOffset_days, 'days');
                this.filter += this.filter ? ' and ' : '';
                this.filter += `${json.dateFilter.dateField} ge dateTime'${startDate}.toISOString()}`;
            }
            if (json.dateFilter.endDate) {
                let endDate = json.dateFilter.endDate.toUpperCase() === 'TODAY' ? moment() :
                    moment(json.dateFilter.endDate);
                endDate = endDate.startOf('day').add(json.dateFilter.endDateOffset_days, 'days');
                this.filter += this.filter ? ' and ' : '';
                this.filter += `${json.dateFilter.dateField} ge dateTime'${endDate}.toISOString()}`;
            }
        }
    }
}

export function createDataSource(dsJson) {

}

export function replacePlaceholdersWithFieldValues(str: string, item) {
    // const matchedItems = str.match(/(?<=\{\{)(.*?)(?=\}\})/g);
    // const matchedItems = str.match(/(?<=\)/g);
    const matchedItems = str.match(/\{\{(.*?)\}\}/g);
    for (const matchedItem of matchedItems) {
        str = str.replace(`${matchedItem}`, item[matchedItem.replace(/\{\{/g, '').replace(/\}\}/g, '')]);
    }
    return str;
}
