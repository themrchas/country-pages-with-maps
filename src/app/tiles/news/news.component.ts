import { Input, Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { NewsItem, NewsSource } from '../../model/news';
import { TileComponent } from '../tile/tile.component';
import { Country } from '../../model/country';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, TileComponent {
  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;
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
