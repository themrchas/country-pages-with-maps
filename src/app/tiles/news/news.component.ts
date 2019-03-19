import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { DataSource } from '../../model/dataSource';
import { NewsItem } from '../../model/news';
import { TileComponent } from '../tile/tile.component';
import { Country } from '../../model/country';
import { BehaviorSubject } from 'rxjs';
import { IframeModalComponent } from 'src/app/modals/iframe-modal/iframe-modal.component';
import { map } from 'rxjs/operators';
import { SpRestService } from 'src/app/services/sp-rest.service';
import { MDBModalService, MDBModalRef } from 'angular-bootstrap-md';

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
  sources: Array<DataSource>;
  modalRef: MDBModalRef;
  constructor(private newsService: NewsService, private spRestService: SpRestService, private modalService: MDBModalService) { }

  ngOnInit() {
    this.sources = this.settings.sources.map(source => {
      return new DataSource(source);
    }) as Array<DataSource>;

    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadNews(selectedCountry);
    });
  }

  loadNews(country) {
    const self = this;

    this.newsService.getNewsFromSources(this.sources, country).then(function(newsItems) {

      // Sort by 'dateField' date descending
      newsItems.sort((a: NewsItem, b: NewsItem) => {
        return b.date - a.date;
      });

      self.newsItems = newsItems;
    });
  }

  openNewsItem(newsItem) {
    const spUrl$ = this.spRestService.getDisplayForm(newsItem.source.listWeb, newsItem.source.listName, newsItem.Id);
    this.modalRef = this.modalService.show(IframeModalComponent, {
      class: 'modal-lg',
      data: {
        country: this.country,
        modalTitle: newsItem.title,
        settings: {
          spUrl$: spUrl$,
          webViewUrl$: spUrl$.pipe(map(x => {
            return x + '&IsDlg=1';
          }))
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
