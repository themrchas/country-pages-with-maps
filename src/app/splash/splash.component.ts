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
  tileGroups: Array<any>;
  paoSettings: any;
  newsSettings: any;
  dtsRequestsSettings: any;
  dtsVouchersSettings: any;
  env: string;
  displaySearch: boolean;
  splashIndex: any;
  splashImages: Array<any>;
  splashIconUrl: string;
  constructor(private utilitiesService: UtilitiesService) { }

  ngOnInit() {
    this.splashImages = ConfigProvider.settings.splashImages;
    this.splashIndex = this.utilitiesService.getRandomInteger(0, this.splashImages.length - 1);
    this.splashImage = `linear-gradient(rgba(20,20,20,0.4), rgba(30,30,30,0.3)), url('` + this.splashImages[this.splashIndex].url  + `')`;
    this.splashDescription = this.splashImages[this.splashIndex].desc;
    this.splashUrl = this.splashImages[this.splashIndex].url;
    this.splashIconUrl = this.splashImages[this.splashIndex].iconUrl;
    this.env = ConfigProvider.env;

    /*this.showEventsWidgets = ConfigProvider.settings.events ? true : false;
    this.showPaoWidget = ConfigProvider.settings.pao ? true : false;*/
    this.tileGroups = ConfigProvider.settings.tileGroups;
    this.paoSettings = ConfigProvider.settings.pao;
    this.newsSettings = ConfigProvider.settings.news;
    this.dtsRequestsSettings = ConfigProvider.settings.dtsRequests;
    this.dtsVouchersSettings = ConfigProvider.settings.dtsVouchers;
    this.displaySearch = !ConfigProvider.settings.hideSearch;
  }

}
