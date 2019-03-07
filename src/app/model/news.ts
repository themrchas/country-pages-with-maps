import * as moment from 'moment';
import * as $ from 'jquery';

export class NewsItem {
    title: string;
    body: string;
    url: string;
    source: NewsSource;
    date: any;
    friendlyDate: any;

    constructor(title: string, body: string, url: string, source: NewsSource, date: any) {
        this.title = title;
        this.body = body;
        this.source = source;
        this.date = date;
        this.url = url;
        this.friendlyDate = moment(date).format('DD MMM').toUpperCase();
    }

}

const ownerDocument = document.implementation.createHTMLDocument('virtual');

export function createNewsItemFromSharePointResult(result: any, source: NewsSource) {
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
    newsItem = new NewsItem(resultTitle, resultText, itemURL, source, moment(result[source.dateField]));
    return newsItem;
}

export class NewsSource {
    listName: string;
    sourceName: string;
    listWeb: string;
    url: string;
    displayForm: string;
    dateField: string;
    contentField: string;
    type: string;  // todo: enum?

    // For document library sources, the folder path should be used as the listName
    constructor(listName: string, sourceName: string, listWeb: string, url: string,
        displayForm: string, dateField: string, type: string, contentField: string) {
        this.listName = listName;
        this.sourceName = sourceName;
        this.listWeb = listWeb;
        this.url = url;
        this.displayForm = displayForm;
        this.type = type;
        this.contentField = type;
    }
}
