import { Component, OnInit } from '@angular/core';
import { EventsService } from '../services/events.service';
import { ConfigProvider } from '../providers/configProvider';
import * as moment from 'moment';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.css']
})
export class UpcomingEventsComponent implements OnInit {

  upcomingEvents: any[];
  constructor( private eventsService: EventsService ) { }

  ngOnInit() {
    const upcomingEventsObserver = {
      next: x => this.upcomingEvents = x
    };

    this.eventsService.getNonExpandedEvents(moment().startOf('day').toISOString(), moment().startOf('day').add(30, 'day').toISOString())
      .subscribe(upcomingEventsObserver);
  }

  onItemClicked(event: any) {
    this.eventsService.openEvent(event);
  }

}

