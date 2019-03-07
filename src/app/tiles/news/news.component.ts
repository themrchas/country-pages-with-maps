import { Input, Component, OnInit, OnDestroy } from '@angular/core';
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
export class NewsComponent implements OnInit, OnDestroy, TileComponent {
  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;
  newsItems: Array<NewsItem>;
  subscription: any;
  constructor(private newsService: NewsService) { }

  ngOnInit() {
    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadNews(selectedCountry);
    });
  }

  loadNews(country) {
    const self = this;
    const sources = this.settings.sources as Array<NewsSource>;
    this.newsService.getNewsFromSources(sources, country).then(function(newsItems) {

      // Sort by 'dateField' date descending
      newsItems.sort((a: NewsItem, b: NewsItem) => {
        return b.date - a.date;
      });

      self.newsItems = newsItems;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
