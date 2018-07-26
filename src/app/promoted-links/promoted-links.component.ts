import { Component, OnInit } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { PromotedLink } from '../model/promotedLink';

@Component({
  selector: 'app-promoted-links',
  templateUrl: './promoted-links.component.html',
  styleUrls: ['./promoted-links.component.css']
})
export class PromotedLinksComponent implements OnInit {
  promotedLinks: any;
  promotedLinksTitle: String;

  constructor() { }

  ngOnInit() {
    this.promotedLinks = ConfigProvider.settings.promotedLinks as Array<PromotedLink>;
    this.promotedLinksTitle = ConfigProvider.settings.promotedLinksTitle;
  }

}
