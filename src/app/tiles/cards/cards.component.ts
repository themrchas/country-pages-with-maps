import { Component, OnInit, Input } from '@angular/core';
import { TileComponent } from '../tile/tile.component';
import { Country } from 'src/app/model/country';
import { DataLayerService } from 'src/app/services/data-layer.service';
import { DataSource } from 'src/app/model/dataSource';
import { SpRestService } from 'src/app/services/sp-rest.service';
import { BaseDataService } from 'src/app/services/baseDataService';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit, TileComponent {
  @Input() settings: any;
  @Input() country: Country;

  view: any[] = undefined;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C']
  };

  cardResults: Array<any>;
  /* single = [
    {
      'name': 'Germany',
      'value': 8940000
    },
    {
      'name': 'USA',
      'value': 5000000
    },
    {
      'name': 'Kenya',
      'value': 7200000
    }
  ];

  multi = [
    {
      'name': 'Germany',
      'series': [
        {
          'name': '2010',
          'value': 7300000
        },
        {
          'name': '2011',
          'value': 8940000
        }
      ]
    },
    {
      'name': 'USA',
      'series': [
        {
          'name': '2010',
          'value': 7870000
        },
        {
          'name': '2011',
          'value': 8270000
        }
      ]
    },
    {
      'name': 'France',
      'series': [
        {
          'name': '2010',
          'value': 5000002
        },
        {
          'name': '2011',
          'value': 5800000
        }
      ]
    }
  ];*/

  constructor(
    private dataLayerService: DataLayerService) { }

  ngOnInit() {
    this.loadCards(this.country);
  }

  loadCards(country: Country) {
    this.dataLayerService.getItemsFromSource(new DataSource(this.settings.source),
    country, this.settings.columns).subscribe(arrResp => {
      const tempCards = [];
      // If there is just one result, then pull the columns out of that result to create the cards
      if (arrResp && arrResp.length === 1) {
        const result = arrResp[0];
        this.settings.columns.forEach(column => {
          tempCards.push({
            name: column.displayName,
            value: result.processedColumns[column.columnName]
          });
        });
      } else { // If there are multiple results, then we only use one column to create the cards
        arrResp.forEach(result => {
          tempCards.push({
            name: result.processedColumns[this.settings.nameColumn],
            value: result.processedColumns[this.settings.valueColumn]
          });
        });
      }
      this.cardResults = tempCards;
    });
  }

}
