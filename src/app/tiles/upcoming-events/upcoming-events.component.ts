import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../services/events.service';
import { ConfigProvider } from '../../providers/configProvider';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Observable, from, empty } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.css']
})
export class UpcomingEventsComponent implements OnInit {

  upcomingEvents: Array<any>;
  constructor( private eventsService: EventsService ) { }

  ngOnInit() {
    let tempEvents = new Array<any>();
    const upcomingEventsObserver = {
      next: x => {
        if (x && x.length > 0) {
          tempEvents = tempEvents.concat(x);
        }
      },
      complete: () => {
        this.upcomingEvents = _.sortBy(tempEvents, 'StartTime');
      }
    };

    from(ConfigProvider.settings.events.sources).pipe(mergeMap(eventSource => {

      return this.eventsService.getNonExpandedEvents(moment().startOf('day').toISOString(),
        moment().startOf('day').add(30, 'day').toISOString(), eventSource);
    })).subscribe(upcomingEventsObserver);

  }

  onItemClicked(event: any) {
    this.eventsService.openEvent(event);
  }

  goToEventsView() {
    window.open(ConfigProvider.settings.events.calendarURL + '/' + ConfigProvider.settings.events.defaultView, '_blank');
  }
}

