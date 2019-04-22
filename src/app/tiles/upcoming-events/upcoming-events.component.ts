import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { EventsService } from '../../services/events.service';
import * as moment from 'moment';
import { from, BehaviorSubject, forkJoin } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
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
export class UpcomingEventsComponent implements OnInit, TileComponent {
  @Input() settings: any;
  @Input() country: Country;
  upcomingEvents: Array<any>;
  modalRef: MDBModalRef;
  constructor( private eventsService: EventsService, private modalService: MDBModalService,
    private spRestService: SpRestService,
    private dataLayerService: DataLayerService) { }

  ngOnInit() {
    this.loadEvents(this.country);
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

    const today = moment().startOf('day');
    const currentMonth = today.clone().startOf('month');
    from(this.settings.sources).pipe(mergeMap(settingsSource => {
      const eventSource = Object.assign({}, settingsSource);
      if (eventSource['camlQuery']) {
        eventSource['camlQuery'] =
          this.spRestService.replacePlaceholdersWithFieldValues(eventSource['camlQuery'], country);
      }

      const arrReqs = [];
      if (this.settings.past === true) {
        // filter only events that end prior to today
        arrReqs.push(this.eventsService.getEventsForRange(currentMonth.toISOString(),
          eventSource, 'Month'));
        arrReqs.push(this.eventsService.getEventsForRange(currentMonth.clone().add(-1, 'months').toISOString(),
          eventSource, 'Month'));
        arrReqs.push(this.eventsService.getEventsForRange(currentMonth.clone().add(-2, 'months').toISOString(),
          eventSource, 'Month'));
      } else {
        // filter only events that end today or later
        arrReqs.push(this.eventsService.getEventsForRange(today.toISOString(),
          eventSource, 'Month'));
        arrReqs.push(this.eventsService.getEventsForRange(currentMonth.clone().add(1, 'months').toISOString(),
          eventSource, 'Month'));
        arrReqs.push(this.eventsService.getEventsForRange(currentMonth.clone().add(2, 'months').toISOString(),
          eventSource, 'Month'));
      }

      return forkJoin(arrReqs);

    })).subscribe({next: x => {
          if (x && x.length === 3) {
            tempEvents = tempEvents.concat(x[0], x[1], x[2]);
            tempEvents = _.uniqBy(tempEvents, 'ID');
            tempEvents = tempEvents.filter(event => {
              return this.settings.past ? (today.diff(event.EndTime) > 0) : (today.diff(event.EndTime) <= 0 );
            });
            this.upcomingEvents = this.settings.past ? tempEvents.sort((a, b) => a.StartTime < b.StartTime ? 1 : -1) :
              tempEvents.sort((a, b) => a.StartTime > b.StartTime ? 1 : -1);
          }
        }
    });

  }

  onItemClicked(event: any) {
    const itemUrl$ = this.spRestService.getDisplayForm(event.source.listWeb, event.source.listName, event.ID);
    this.modalRef = this.modalService.show(IframeModalComponent, {
      class: 'modal-lg',
      data: {
        country: this.country,
        modalTitle: event.Title,
        settings: {
          itemUrl$: itemUrl$,
          previewUrl$: itemUrl$.pipe(map(x => {
            return x + '&IsDlg=1';
          }))
        }
      }
    });
  }

}

