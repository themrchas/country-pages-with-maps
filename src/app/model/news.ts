import * as $ from 'jquery';
import * as moment from 'moment';
import { DataSource, Column, SourceDataType } from './dataSource';

export class NewsItem {
    friendlyDate: any;

    constructor(public title: string,
        public body: string,
        public source: DataSource,
        public Id: any,
        public date: any,
        public badgeType: string
        ) {
        this.friendlyDate = moment(date).format('DD MMM').toUpperCase();
    }  //constructor
}

const ownerDocument = document.implementation.createHTMLDocument('virtual');

export function createNewsItemFromSharePointResult(result: any, source: DataSource) {
    let newsItem, resultText, resultTitle, badgeType;
    if (source.type === SourceDataType.DOC_LIBRARY) {
        resultTitle = result.rawData.Title || result.rawData.Name;
        resultText = null;
    }  else if (source.type === 'list') {
        resultTitle = result.rawData.Title;
        resultText = source.contentField ? $(result.rawData[source.contentField], ownerDocument).text() : null;
        // TODO: if contentField is not an HTML field, just grab it directly
    }  else {
        resultText = $(result.rawData.Body, ownerDocument).text();
        resultTitle = result.rawData.Title;
    }



    //Grab dates to be used for determing id item requires a 'New' or 'Updated' badge
    const itemCreated = moment(result.rawData['PublishedDate'], 'YYYY-MM-DDTHH:mm:SS');
    const itemModified = moment(result.rawData['Modified'], 'YYYY-MM-DDTHH:mm:SS');

    if (moment.duration(moment().diff(itemCreated)).as('hours') <= 24) 
        badgeType = 'New'
    else if (moment.duration(moment().diff(itemModified)).as('hours') <= 24)
         badgeType = "Updated";



    newsItem = new NewsItem(resultTitle, resultText, source, result.id, moment(result[source.dateField]),badgeType);
    return newsItem;
}
