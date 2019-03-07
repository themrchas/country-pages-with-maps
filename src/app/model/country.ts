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
        result.Title,
        result.CountryMM.Label,
        result.ISO_2_CountryCode,
        result.ISO_3_CountryCode,
        result.Region,
        result.Population,
        result.FlagImage ? result.FlagImage.Url : null);
}

export function createCountryArrayFromSharePointResponse(resp) {
    let retVal: Array<Country>;
    if (resp && resp['d'] && resp['d'].results) {
        retVal = resp['d'].results.map(createCountryFromSharePointResult);
    } else {
        console.error('Unable to retrieve countries from SP response');
        retVal = new Array<Country>();
    }

    return retVal;
}
