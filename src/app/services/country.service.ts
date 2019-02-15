import { Injectable } from '@angular/core';
import { SpListService } from './sp-list.service';
import { ConfigProvider } from '../providers/configProvider';
import { Country, createCountryArrayFromSharePointResponse } from '../model/country';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private countrySubject = new BehaviorSubject<Observable<Country>>(null);
  selectedCountry = this.countrySubject.asObservable();

  constructor(private spListService: SpListService) {}

  getCountry(countryCode): Observable<Country> {
    const filter = `Country_x0020_Code eq '${countryCode.toUpperCase()}'`;
    return this.spListService.getListItems(ConfigProvider.settings.country.webURL,
      ConfigProvider.settings.country.listName, null, filter, 1).pipe(map(resp => {
        const respArray = createCountryArrayFromSharePointResponse(resp);
        return respArray.length > 0 ? respArray[0] : null;
      }));
  }

  getCountries(): Observable<Array<Country>> {
    return this.spListService.getListItems(ConfigProvider.settings.country.webURL,
      ConfigProvider.settings.country.listName).pipe(map(resp => {
        return createCountryArrayFromSharePointResponse(resp);
    }));
  }

  changeCountry(countryCode: string) {
    this.countrySubject.next(this.getCountry(countryCode));
  }
}
