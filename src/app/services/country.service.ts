import { Injectable } from '@angular/core';
import { SpRestService } from './sp-rest.service';
import { ConfigProvider } from '../providers/configProvider';
import { Country, createCountryArrayFromSharePointResponse } from '../model/country';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  selectedCountry = new BehaviorSubject<Country>(null);

  constructor(private spRestService: SpRestService) {}

  // Use ISO 3 for country code
  getCountry(countryCode): Observable<Country> {
      let viewXml = ConfigProvider.settings.country.camlQueryFilterCountry as string;
      viewXml = ConfigProvider.replacePlaceholdersWithFieldValues(viewXml, { countryCode: countryCode.toUpperCase()});

      return this.spRestService.getListItemsCamlQuery(ConfigProvider.settings.country.listWeb,
        ConfigProvider.settings.country.listName,
        JSON.stringify({ViewXml: `${viewXml}`}),
        ConfigProvider.requestDigest).pipe(map(resp => {
          const respArray = createCountryArrayFromSharePointResponse(resp);
          return respArray.length > 0 ? respArray[0] : null;
        }));
  }

  getCountries(): Observable<Array<Country>> {
    return this.spRestService.getListItemsCamlQuery(ConfigProvider.settings.country.listWeb,
      ConfigProvider.settings.country.listName,
      JSON.stringify({ViewXml: `${ConfigProvider.settings.country.camlQueryAllCountries}`}),
      ConfigProvider.requestDigest).pipe(map(resp => {
        return createCountryArrayFromSharePointResponse(resp);
    }));
  }

  changeCountry(countryCode: string) {
      this.getCountry(countryCode).subscribe(country => this.selectedCountry.next(country));
  }
}
