import { Country } from '../../model/country';
import { BehaviorSubject } from 'rxjs';

export interface TileComponent {
    settings: any;
    country: BehaviorSubject<Country>;
}
