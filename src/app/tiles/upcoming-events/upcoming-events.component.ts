import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { EventsService } from '../../services/events.service';
import * as moment from 'moment';
import { from, BehaviorSubject, forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TileComponent } from '../tile/tile.component';
import { Country } from '../../model/country';
import * as _ from 'lodash';
import { IframeModalComponent } from '../../modals/iframe-modal/iframe-modal.component';
import { MDBModalService, MDBModalRef } from 'angular-bootstrap-md';
import { map } from 'rxjs/operators';
import { SpRestService } from 'src/app/services/sp-rest.service';
import { DataLayerService } from 'src/app/services/data-layer.service';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.css']
})
export class UpcomingEventsComponent implements OnInit, OnDestroy, TileComponent {
  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;
  upcomingEvents: Array<any>;
  subscription: any;
  modalRef: MDBModalRef;
  constructor( private eventsService: EventsService, private modalService: MDBModalService,
    private spRestService: SpRestService,
    private dataLayerService: DataLayerService) { }

  ngOnInit() {
    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadEvents(selectedCountry);
    });
  }

  loadEvents(country) {
    let tempEvents = new Array<any>();

    /* from(this.settings.sources).pipe(mergeMap(eventSource => {
      return this.eventsService.getNonExpandedEvents(moment().startOf('day').toISOString(),
        moment().startOf('day').add(this.settings.numDays, 'day').toISOString(), eventSource);
    })).subscribe({next: x => {
          if (x && x.length > 0) {
            tempEvents = tempEvents.concat(x);
          }
        },
        complete: () => this.upcomingEvents = tempEvents.sort((a, b) => a.StartTime > b.StartTime ? 1 : -1)
    }); */

    from(this.settings.sources).pipe(mergeMap(eventSource => {

      if (eventSource['camlQuery']) {
        eventSource['camlQuery'] =
          this.dataLayerService.replacePlaceholdersWithFieldValues(eventSource['camlQuery'], country);
      }

      // today
      const today = moment().startOf('day');
      const req1 = this.eventsService.getEventsForRange(today.toISOString(),
        eventSource, 'Month');
      const req2 = this.eventsService.getEventsForRange(moment().add(1, 'months').toISOString(),
      eventSource, 'Month');
      const req3 = this.eventsService.getEventsForRange(moment().add(2, 'months').toISOString(),
      eventSource, 'Month');

      return forkJoin([req1, req2, req3]);

    })).subscribe({next: x => {
          if (x && x.length === 3) {
            tempEvents = tempEvents.concat(x[0], x[1], x[2]);
            tempEvents = _.uniqBy(tempEvents, 'ID');
            this.upcomingEvents = tempEvents.sort((a, b) => a.StartTime > b.StartTime ? 1 : -1);
          }
        }
    });

  }

  onItemClicked(event: any) {
    const spUrl$ = this.spRestService.getDisplayForm(event.source.listWeb, event.source.listName, event.ID);
    this.modalRef = this.modalService.show(IframeModalComponent, {
      class: 'modal-lg',
      data: {
        country: this.country,
        modalTitle: event.Title,
        settings: {
          spUrl$: spUrl$,
          webViewUrl$: spUrl$.pipe(map(x => {
            return x + '&IsDlg=1';
          }))
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

