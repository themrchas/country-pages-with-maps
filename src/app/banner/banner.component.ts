import { Component, OnInit } from '@angular/core';
import { ConfigProvider } from '../providers/configProvider';
import { SpListService } from '../services/sp-list.service';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  announcementHtml: string;
  announcementType: string;
  env: string;
  constructor(private spListService: SpListService) { }

  ngOnInit() {
    this.env = ConfigProvider.env;
    const bannerListName = ConfigProvider.settings.banner.listName;
    const bannerWebUrl = ConfigProvider.settings.banner.webURL;
    const camlQuery = JSON.stringify({ViewXml: `<View><Query><Where><Or>
    <IsNull><FieldRef Name="Expires" /></IsNull><Geq><FieldRef Name="Expires" />
    <Value IncludeTimeValue="TRUE" Type="DateTime"><Today /></Value></Geq></Or></Where>
    <OrderBy><FieldRef Name="Modified" Ascending="True" /></OrderBy></Query><RowLimit>1</RowLimit></View>`});

    this.spListService.getContextInfo(bannerWebUrl).pipe(mergeMap((contextInfo) => {
      const requestDigest = contextInfo['d'].GetContextWebInformation.FormDigestValue;
      return this.spListService.getListItemsCamlQuery(bannerWebUrl, bannerListName, camlQuery, requestDigest);
    })).subscribe({
      next: response => {
        if (response['d'].results && response['d'].results.length > 0) {
          const announcementJson = response['d'].results[0];
          this.announcementHtml = announcementJson.Body;
          this.announcementType = announcementJson.AnnouncementType;
        }
      }
    });
  }

}
