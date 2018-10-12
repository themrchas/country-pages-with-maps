import { Component, OnInit } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  splashImage: any;
  splashStyle: any;
  splashDescription: any;
  splashUrl: string;
  showEventsWidgets: boolean;
  showPaoWidget: boolean;
  paoSettings: any;
  newsSettings: any;
  env: string;
  displaySearch: boolean;
  splashIndex: any;
  splashImages: Array<any>;
  constructor(private utilitiesService: UtilitiesService) { }

  ngOnInit() {
    this.splashImages = ConfigProvider.settings.splashImages;
    this.splashIndex = this.utilitiesService.getRandomInteger(0, this.splashImages.length - 1);
    this.splashImage = `linear-gradient(rgba(20,20,20,0.4), rgba(30,30,30,0.3)), url('` + this.splashImages[this.splashIndex].url  + `')`;
    this.splashDescription = this.splashImages[this.splashIndex].desc;
    this.splashUrl = this.splashImages[this.splashIndex].url;
    this.env = ConfigProvider.env;

    this.showEventsWidgets = ConfigProvider.settings.events ? true : false;
    this.showPaoWidget = ConfigProvider.settings.pao ? true : false;
    this.paoSettings = ConfigProvider.settings.pao;
    this.newsSettings = ConfigProvider.settings.news;
    this.displaySearch = !ConfigProvider.settings.hideSearch;
  }

}
