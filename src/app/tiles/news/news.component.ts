import { Input, Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { NewsItem, NewsSource } from '../../model/news';
import * as moment from 'moment';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  @Input()
  settings: any;
  newsItems: Array<NewsItem>;
  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    const self = this;
    const sources = this.settings.sources as Array<NewsSource>;
    this.newsService.getNewsFromSources(sources).then(function(newsItems) {

      // Sort by 'dateField' date descending
      newsItems.sort((a: NewsItem, b: NewsItem) => {
        return b.date - a.date;
      });

      self.newsItems = newsItems;
    });
  }
}
