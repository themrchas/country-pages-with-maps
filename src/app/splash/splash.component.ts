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
  constructor(private utilitiesService: UtilitiesService) { }

  ngOnInit() {
    const splashImages = ConfigProvider.settings.splashImages;
    const splashIndex = this.utilitiesService.getRandomInteger(0, splashImages.length - 1);
    this.splashImage = `linear-gradient(rgba(20,20,20,0.4), rgba(30,30,30,0.3)), url('` + splashImages[splashIndex].url  + `')`;
    this.splashDescription = splashImages[splashIndex].desc;
    this.splashUrl = splashImages[splashIndex].url;
  }

}
