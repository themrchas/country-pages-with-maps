import { Injectable } from '@angular/core';
import { SpRestService } from './sp-rest.service';
import { ConfigProvider } from '../providers/configProvider';
import { Country, createCountryArrayFromSharePointResponse } from '../model/country';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource, replacePlaceholdersWithFieldValues } from '../model/dataSource';
import { DataLayerService } from './data-layer.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  countrySource: any;
  selectedCountry = new BehaviorSubject<Country>(null);

  constructor(private dataLayerService: DataLayerService) {
    this.countrySource = ConfigProvider.settings.country;
    console.log('ConfigProvider.settings.country in country.service.ts is',this.countrySource);
  }

  // Use ISO 3 for country code
  getCountry(countryCode): Observable<Country> {
      this.countrySource.camlQuery = this.countrySource.camlQueryFilterCountry;
      const filterObj = { countryCode: countryCode.toUpperCase()};

      return this.dataLayerService.getItemsFromSource(this.countrySource,
        filterObj).pipe(map(resp => {
          const respArray = createCountryArrayFromSharePointResponse(resp);
          return respArray.length > 0 ? respArray[0] : null;
        }));
  }

  getCountries(): Observable<Array<Country>> {
    this.countrySource.camlQuery = this.countrySource.camlQueryAllCountries;

    return this.dataLayerService.getItemsFromSource(this.countrySource as DataSource).pipe(map(resp => {
        return createCountryArrayFromSharePointResponse(resp);
    }));
  }

  changeCountry(countryCode: string) {
      this.getCountry(countryCode).subscribe(country => this.selectedCountry.next(country));
  }
}
