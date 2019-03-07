import { Component, OnInit, Input } from '@angular/core';
import { EventsService } from '../../services/events.service';
import { ConfigProvider } from '../../providers/configProvider';
import * as moment from 'moment';
import * as _ from 'lodash';
import { from, BehaviorSubject } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { TileComponent } from '../tile/tile.component';
import { Country } from '../../model/country';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: './upcoming-events.component.html',
  styleUrls: ['./upcoming-events.component.css']
})
export class UpcomingEventsComponent implements OnInit, TileComponent {
  @Input() settings: any;
  @Input() country: BehaviorSubject<Country>;
  upcomingEvents: Array<any>;
  constructor( private eventsService: EventsService ) { }

  ngOnInit() {
    let tempEvents = new Array<any>();

    from(this.settings.sources).pipe(mergeMap(eventSource => {
      return this.eventsService.getNonExpandedEvents(moment().startOf('day').toISOString(),
        moment().startOf('day').add(this.settings.numDays, 'day').toISOString(), eventSource);
    })).subscribe({next: x => {
          if (x && x.length > 0) {
            tempEvents = tempEvents.concat(x);
          }
        },
        complete: () => this.upcomingEvents = _.sortBy(tempEvents, 'StartTime')
    });

  }

  // To Do: Tie in with Modal?
  onItemClicked(event: any) {
    this.eventsService.openEvent(event);
  }
}

