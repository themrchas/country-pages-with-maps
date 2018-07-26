import { Component, OnInit } from '@angular/core';
import { EventsService } from '../services/events.service';
import { ConfigProvider } from '../providers/configProvider';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-today-events',
  templateUrl: './today-events.component.html',
  styleUrls: ['./today-events.component.css']
})
export class TodayEventsComponent implements OnInit {

  selectedDate: any;
  now: any;
  eventsList: Array<any>;
  infoUrl: string;
  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.selectedDate = moment();
    this.now = moment();
    this.fetchCalendarEvents();
    this.infoUrl = ConfigProvider.settings.eventsInfoUrl;
  }

  fetchCalendarEvents() {
    const isoDateString = moment.utc(this.selectedDate).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const self = this;
    let tempEvents = new Array<any>();
    const viewGuids = ConfigProvider.settings.eventsViewGuids;

    this.eventsService.getEventsForSelectedDayMultipleViews(isoDateString, viewGuids).subscribe({
      next: x => {
        if (x) {
          tempEvents = tempEvents.concat(x);
        }
      },
      complete: () => {
        self.eventsList = self.compareEachItemAgainstPreviousItem(tempEvents);
      }
    });

  }

  compareEachItemAgainstPreviousItem (items: any[]): any[] {
    items = _.sortBy(items, 'eventDate');
    let prevItem = null;

    _.each(items, function(item) {
      item.isSimilarToPreviousItem = !prevItem || (prevItem.isAllDayEvent && item.isAllDayEvent) ||
        item.eventDate.isSame(prevItem.eventDate);
      prevItem = item;
    });
    return items;
  }

  onItemClicked(event: any) {
    this.eventsService.openEvent(event);
  }

  nextDayClicked() {
    this.selectedDate.add(1, 'days');
    this.fetchCalendarEvents();
  }

  prevDayClicked() {
    this.selectedDate.add(-1, 'days');
    this.fetchCalendarEvents();
  }

  goToEventsView() {
    window.open(ConfigProvider.settings.eventsCalendarURL + '/' + ConfigProvider.settings.eventsDefaultView, '_blank');
  }

}
