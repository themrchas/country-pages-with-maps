import * as moment from 'moment';

export class NewsItem {
    title: string;
    body: string;
    url: string;
    source: NewsSource;
    date: any;

    constructor(title: string, body: string, url: string, source: NewsSource, date: any) {
        this.title = title;
        this.body = body;
        this.source = source;
        this.date = date;
        this.url = url;
    }

}

const ownerDocument = document.implementation.createHTMLDocument('virtual');

export function createNewsItemFromSharePointResult(result: any, source: NewsSource) {
    let newsItem, itemURL, resultText, resultTitle;
    if (source.type === 'docLibrary') {
        itemURL = result.ServerRelativeUrl;
        resultTitle = result.Title || result.Name;
        resultText = null;
    } else {
        itemURL = `${source.webURL}/Lists/${source.listName}/${source.displayForm}?ID=${result.Id}`;
        resultText = $(result.Body, ownerDocument).text();
        resultTitle = result.Title;
    }
    newsItem = new NewsItem(resultTitle, resultText, itemURL, source, moment(result[source.dateField]));
    return newsItem;
}

export class NewsSource {
    listName: string;
    sourceName: string;
    webURL: string;
    sourceURL: string;
    displayForm: string;
    dateField: string;
    type: string;  // todo: enum?

    // For document library sources, the folder path should be used as the listName
    constructor(listName: string, sourceName: string, webURL: string, sourceURL: string,
        displayForm: string, dateField: string, type: string) {
        this.listName = listName;
        this.sourceName = sourceName;
        this.webURL = webURL;
        this.sourceURL = sourceURL;
        this.displayForm = displayForm;
        this.type = type;
    }
}
