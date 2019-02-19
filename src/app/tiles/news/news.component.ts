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
  past24Hours: any;
  cicItems: Array<any>;
  cicURL: string;
  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.past24Hours = moment().subtract(24, 'hours');
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

    if (this.settings.cic) {
      this.cicURL = this.settings.cic.url;
      // Special case for Command Info Catalog
      this.newsService.getCicItems(this.settings.cic.webURL, this.settings.cic.listName, this.past24Hours).subscribe({
        next: response => {
          if (response && response['d']) {
            this.cicItems = response['d'].results;
          }
        }
      });
    }
  }
}
