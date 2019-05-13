import * as moment from 'moment';
import { ConfigProvider } from '../providers/configProvider';

export class Country {

    constructor(
        public title: string,
        public countryMM: string,
        public countryWebTas: string,
        public countryCode2: string,
        public countryCode3: string,
        public region: string,
        public population: number,
        public campaigns: Array<string>) {}
}

export function createCountryFromSharePointResult(result: any) {
    // WebTAS and SharePoint may have different namings for countries
    const webTasOverrides = ConfigProvider.settings.country.webTasCountryOverrides;
    const countrySpLabel = result.rawData.CountryMM.Label;
    const countryWebTasLabel = webTasOverrides && webTasOverrides[countrySpLabel] ?
        webTasOverrides[countrySpLabel] : countrySpLabel;
    const campaigns = result.rawData.Campaign ? result.rawData.Campaign.results : null;

    return new Country(
        result.rawData.Title,
        countrySpLabel,
        countryWebTasLabel,
        result.rawData.ISO_2_CountryCode,
        result.rawData.ISO_3_CountryCode,
        result.rawData.RegionMM ? result.rawData.RegionMM.Label : null,
        result.rawData.Population,
        campaigns ? campaigns.map(campaign => campaign.Label) : null
    );
}

export function createCountryArrayFromSharePointResponse(resp) {
    let retVal: Array<Country>;
    if (resp) {
        retVal = resp.map(createCountryFromSharePointResult);
    } else {
        console.error('Unable to retrieve countries from SP response');
        retVal = new Array<Country>();
    }

    return retVal;
}
