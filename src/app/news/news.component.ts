import { Component, OnInit } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { NewsService } from '../services/news.service';
import { NewsItem, NewsSource } from '../model/news';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  newsWidgetTitle: String;
  newsItems: Array<NewsItem>;
  infoUrl: string;
  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.newsWidgetTitle = ConfigProvider.settings.newsWidgetTitle;
    this.infoUrl = ConfigProvider.settings.newsInfoUrl;
    this.loadNews();
  }

  loadNews() {
    const self = this;
    const sources = ConfigProvider.settings.newsSources as Array<NewsSource>;
    this.newsService.getNewsFromSources(sources).then(function(newsItems) {

      // Sort by 'dateField' date descending
      newsItems.sort((a: NewsItem, b: NewsItem) => {
        return b.date - a.date;
      });

      self.newsItems = newsItems;
    });
  }
}
