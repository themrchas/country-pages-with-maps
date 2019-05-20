import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { MDBModalRef } from 'angular-bootstrap-md';
import { Column, SourceResult } from 'src/app/model/dataSource';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss']
})
export class DetailsModalComponent implements OnInit, AfterViewInit {
  // Inputs
  modalTitle: string;
  sourceResult: SourceResult;

  itemUrl$: any;
  maxHeight = 410;
  @ViewChildren('item') items: QueryList<ElementRef>;

  constructor(public modalRef: MDBModalRef) { }

  ngOnInit() {
    this.itemUrl$ = this.sourceResult.itemUrl$;
  }

  ngAfterViewInit() {
    let sumHeights = 20; // initial margins
    this.items.forEach(item => {
      sumHeights += item.nativeElement.clientHeight + 20;
    });
    let currSum = 0;
    this.items.forEach(item => {
      const prevSum = currSum;
      currSum += item.nativeElement.clientHeight + 20;
      if (currSum > this.maxHeight) {
        // Check if the remaining heights + current item's height fit in maxHeight
        if (this.maxHeight < sumHeights - prevSum) {
          this.maxHeight = currSum;
        }
      }
    });
  }

}
