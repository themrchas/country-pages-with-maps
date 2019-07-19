import { Component, OnInit, Input, ViewChild, AfterViewChecked } from '@angular/core';
import { TileComponent } from '../tile/tile.component';
import { Country } from 'src/app/model/country';
import { DataLayerService } from 'src/app/services/data-layer.service';
import { DataSource } from 'src/app/model/dataSource';
import { SpRestService } from 'src/app/services/sp-rest.service';
import { BaseDataService } from 'src/app/services/baseDataService';
import {NumberCardComponent} from '@swimlane/ngx-charts';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit, TileComponent, AfterViewChecked {
  @Input() settings: any;
  @Input() country: Country;
  @ViewChild(NumberCardComponent) numCard: NumberCardComponent;
  @ViewChild('cardContainer') cardElement: any;

  ieAdjusted = false;
  isIE: boolean;
  view: any[] = undefined;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C']
  };

  cardResults: Array<any>;
  customColorResults: Array<any>;
  customFunc: any;

  constructor(
    private dataLayerService: DataLayerService) { }

  ngOnInit() {
    // Create a function to apply custom colors based on the card's value
    // Since we can't store the function in our config JSON, the JSON instead just stores the body
    // of the function and we create the full function dynamically here.
    if (this.settings.colorFunc) {
      this.customFunc = new Function('value', this.settings.colorFunc);
    }
    this.loadCards(this.country);

    // TODO: move this somewhere central
    const ua = navigator.userAgent;
    const M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    this.isIE = (/trident/i.test(M[1])) ? true : false;
  }

  ngAfterViewChecked() {
    // Very hacky way to get labels to display in IE11 (foreignObject not supported)
    // NGX cards displays the value as a <text> element and the label as a <foreignObject> element
    // Instead, grab the foreignObject and get the label text and create a new text element with
    // the label text
    if (this.isIE && this.cardElement && !this.ieAdjusted) {
      $('foreignObject').each((index, el) => {
        const foreignObj = $(el);
        const label = foreignObj.text();

        // Apply the same styles as the value text item.
        // NOTE: this seems to grab the font-size too early, so the font-size is always 12pt
        const textElement = foreignObj.next();
        const style = textElement.attr('style');

        const newElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        newElement.textContent = label;
        newElement.setAttribute('x', foreignObj.attr('x'));
        newElement.setAttribute('y', foreignObj.attr('y'));
        newElement.setAttribute('style', style);
        el.parentNode.appendChild(newElement);
      });
      this.ieAdjusted = true;
    }
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
      this.customColorResults = [...this.cardResults];
    });
  }

  // For some reason, NGX passes the label and not the value for custom colors.  Need to retrieve the value
  // from the customColorResults object.  Assumes labels are arriving in order.
  customColor = (label) => {
    // Get the first item
    const value = this.customColorResults[0].value;

    // Remove the first item
    this.customColorResults.shift();

    return this.customFunc(value);
  }

}
