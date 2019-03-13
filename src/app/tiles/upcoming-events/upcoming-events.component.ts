import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { EventsService } from '../../services/events.service';
import * as moment from 'moment';
import { from, BehaviorSubject } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TileComponent } from '../tile/tile.component';
import { Country } from '../../model/country';

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
  constructor( private eventsService: EventsService ) { }

  ngOnInit() {
    this.subscription = this.country.subscribe(selectedCountry => {
      this.loadEvents(selectedCountry);
    });

  }

  loadEvents(country) {
    let tempEvents = new Array<any>();

    from(this.settings.sources).pipe(mergeMap(eventSource => {
      return this.eventsService.getNonExpandedEvents(moment().startOf('day').toISOString(),
        moment().startOf('day').add(this.settings.numDays, 'day').toISOString(), eventSource);
    })).subscribe({next: x => {
          if (x && x.length > 0) {
            tempEvents = tempEvents.concat(x);
          }
        },
        complete: () => this.upcomingEvents = tempEvents.sort((a, b) => a.StartTime > b.StartTime ? 1 : -1)
    });

    /* from(this.settings.sources).pipe(mergeMap(eventSource => {
      return this.eventsService.getEventsForRange(moment().startOf('day').toISOString(),
        eventSource, undefined, 'Month');
    })).subscribe({next: x => {
          if (x && x.length > 0) {
            tempEvents = tempEvents.concat(x);
          }
        },
        complete: () => this.upcomingEvents = tempEvents.sort((a, b) => a.StartTime > b.StartTime ? 1 : -1)
    }); */

  }

  // To Do: Tie in with Modal?
  onItemClicked(event: any) {
    this.eventsService.openEvent(event);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

