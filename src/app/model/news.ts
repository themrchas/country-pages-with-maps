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

export function createNewsItemFromSharePointResult(result: any, source: NewsSource) {
    const itemURL = `${source.webURL}/Lists/${source.listName}/${source.displayForm}?ID=${result.Id}`;
    return new NewsItem(result.Title, $(result.Body).text(), itemURL, source, moment(result[source.dateField]));
}

export class NewsSource {
    listName: string;
    sourceName: string;
    webURL: string;
    sourceURL: string;
    displayForm: string;
    dateField: string;

    constructor(listName: string, sourceName: string, webURL: string, sourceURL: string, displayForm: string, dateField: string) {
        this.listName = listName;
        this.sourceName = sourceName;
        this.webURL = webURL;
        this.sourceURL = sourceURL;
        this.displayForm = displayForm;
    }
}
