import { Injectable } from '@angular/core';
import { SpListService } from './sp-list.service';
import { ConfigProvider } from '../providers/configProvider';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private spListService: SpListService) { }

  getCountry(countryCode) {
    const filter = `Country_x0020_Code eq ${countryCode}`;
    return this.spListService.getListItems(ConfigProvider.settings.country.webURL,
      ConfigProvider.settings.country.listName, null, filter, 1);
  }

  getCountries() {
    // Group by Region?
    return this.spListService.getListItems(ConfigProvider.settings.country.webURL,
      ConfigProvider.settings.country.listName);
  }

}
