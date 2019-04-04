import * as $ from 'jquery';
import * as moment from 'moment';
import { DataSource, Column } from './dataSource';

export class NewsItem {
    friendlyDate: any;

    constructor(public title: string,
        public body: string,
        public url: string,
        public source: DataSource,
        public Id: any,
        public date: any) {
        this.friendlyDate = moment(date).format('DD MMM').toUpperCase();
    }
}

const ownerDocument = document.implementation.createHTMLDocument('virtual');

export function createNewsItemFromSharePointResult(result: any, source: DataSource, columns?: Array<Column>) {
    let newsItem, itemURL, resultText, resultTitle;
    if (source.type === 'docLibrary') {
        itemURL = result.ServerRelativeUrl;
        resultTitle = result.Title || result.Name;
        resultText = null;
    } else if (source.type === 'list') {
        itemURL = `${source.listWeb}/Lists/${source.listName}/${source.displayForm}?ID=${result.Id}` + '&Source=' + window.location.href;
        resultTitle = result.Title;
        resultText = source.contentField ? $(result[source.contentField], ownerDocument).text() : null;
        // TODO: if contentField is not an HTML field, just grab it directly
    } else {
        itemURL = `${source.listWeb}/Lists/${source.listName}/${source.displayForm}?ID=${result.Id}`;
        resultText = $(result.Body, ownerDocument).text();
        resultTitle = result.Title;
    }
    newsItem = new NewsItem(resultTitle, resultText, itemURL, source, result.Id, moment(result[source.dateField]));
    return newsItem;
}
