import * as moment from 'moment';

export class Country {

    constructor(
        public title: string,
        public countryMM: string,
        public countryCode2: string,
        public countryCode3: string,
        public region: string,
        public population: number,
        public flagUrl: string) {}
}

export function createCountryFromSharePointResult(result: any) {
    return new Country(
        result.rawData.Title,
        result.rawData.CountryMM.Label,
        result.rawData.ISO_2_CountryCode,
        result.rawData.ISO_3_CountryCode,
        result.rawData.RegionMM.Label,
        result.rawData.Population,
        result.rawData.FlagImage ? result.FlagImage.Url : null);
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
