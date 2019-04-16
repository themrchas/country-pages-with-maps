import * as $ from 'jquery';
import * as moment from 'moment';
import { DataSource, Column, SourceDataType } from './dataSource';

export class NewsItem {
    friendlyDate: any;

    constructor(public title: string,
        public body: string,
        public source: DataSource,
        public Id: any,
        public date: any) {
        this.friendlyDate = moment(date).format('DD MMM').toUpperCase();
    }
}

const ownerDocument = document.implementation.createHTMLDocument('virtual');

export function createNewsItemFromSharePointResult(result: any, source: DataSource) {
    let newsItem, resultText, resultTitle;
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
    newsItem = new NewsItem(resultTitle, resultText, source, result.Id, moment(result[source.dateField]));
    return newsItem;
}
