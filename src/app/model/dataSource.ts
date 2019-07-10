import { ConfigProvider } from '../providers/configProvider';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'lodash';

export interface DateFilter {
    startDate: string;
    startDateOffset: number;  // Ex: Days from <startDate>, ex: -30 days from today
    startDateOffset_unit: string; // moment offset, ex: 'days', 'months', 'years'
    startDateField: string;
    endDate: string;
    endDateOffset: number; // Ex: Days from <endDate>
    endDateOffset_unit: string; // moment offset, ex: 'days', 'months', 'years'
    endDateField: string;
}

export interface Column {
    columnName: string;
    displayName: string;
    value?: any;
    type?: string;
    showInModal?: boolean;
}

export class SourceResult {
    constructor(
        public source: DataSource,
        public processedColumns: Array<Column>,
        public modalColumns: Array<Column>,
        public rawData: any,
        public title: string,
        public id: string,
        public modifiedDate: string,
        public itemUrl$?: Observable<any>,
        public fileType?: string,
        public downloadUrl$?: Observable<any>,
        public previewUrl$?: Observable<any>,
        public fullScreenUrl$?: Observable<any>
    ) {}
}

export const enum SourceServiceType {
    SHAREPOINT = 'SharePoint',
    WEBTAS = 'WebTAS'
}

export const enum SourceDataType {
    DOC_LIBRARY = 'docLibrary',
    LIST = 'list'
    
}

export class DataSource {
    service: SourceServiceType;
    listName: string;
    listWeb: string;
    displayName?: string;
    url?: string;
    dateField?: string;
    type?: SourceDataType;
    contentField?: string;
    camlQuery?: string;
    select?: string;
    expand?: string;
    filter?: string;
    order?: string;
    rowLimit?: number;
    dateFilter?: DateFilter;

    // For document library sources, the folder path should be used as the listName
    constructor(json) {
        this.service = json.service || SourceServiceType.SHAREPOINT;
        this.listName = json.listName;
        this.listWeb = json.listWeb;
        this.displayName = json.displayName;
        this.url = json.url;
        this.type = json.type || SourceDataType.LIST;
        this.contentField = json.contentField;
        this.camlQuery = json.camlQuery;
        this.select = json.select;
        this.expand = json.expand;
        this.filter = json.filter;
        this.order = json.order;
        this.rowLimit = json.rowLimit;
        this.dateField = json.dateField;  // For use on news items
        this.dateFilter = json.dateFilter as DateFilter;

        if (json.dateFilter) {
            if (json.dateFilter.startDate) {
                let startDate = json.dateFilter.startDate.toUpperCase() === 'TODAY' ? moment() :
                    moment(json.dateFilter.startDate);
                startDate = startDate.startOf('day').add(json.dateFilter.startDateOffset,
                    json.dateFilter.startDateOffset_unit);
                this.filter += this.filter ? ' and ' : '';
                this.filter += `${json.dateFilter.startDateField} ge dateTime'${startDate.toISOString()}'`;
            }
            if (json.dateFilter.endDate) {
                let endDate = json.dateFilter.endDate.toUpperCase() === 'TODAY' ? moment() :
                    moment(json.dateFilter.endDate);
                endDate = endDate.startOf('day').add(json.dateFilter.endDateOffset,
                    json.dateFilter.endDateOffset_unit);
                this.filter += this.filter ? ' and ' : '';
                this.filter += `${json.dateFilter.endDateField} le dateTime'${endDate.toISOString()}'`;
            }
        }

        //Analyze select statement for presence of specific columns
        if (this.type && this.select)
            this.select = this.verifySelect(this.listName,this.select,this.type);
        
    }

        //Verify  select statements found in configuration have required columns and modify as required
        private verifySelect(listName,select,listType) {

        let listColumns: Array<string> = ["Id","Created", "Modified"];
        let docLibColumns: Array<string> = ["Id","Created", "Modified","FileRef","File_x0020_Type","FileLeafRef"];

        //Ensure string does not mistakenly terminate with a comma -> preventative measure
         select = _.endsWith(select,",") ? select.substring(0,select.length-1) : select;

        if (listType === "docLibrary") {

            for(let column of docLibColumns) 
                if (!select.includes(column))
                    select = select.concat(",",column);
       
                    ConfigProvider.settings.debugLog &&  console.log("**listName is:",listName,"select is:",select,"type is type is docLibrary");
        } 

        else if (listType === "blog" || listType === "list") {

            for(let column of listColumns) 

                if (!select.includes(column))
                    select = select.concat(",",column);

                    ConfigProvider.settings.debugLog && console.log("**listName is:",listName,"select is:",select,"type is type is "+listType);
        }

        return select;
       
    }
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
