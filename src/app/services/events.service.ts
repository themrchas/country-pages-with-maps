import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable, from } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, mergeMap } from 'rxjs/operators';
import { SpServicesWrapperService } from './sp-services-wrapper.service';
import { ConfigProvider } from '../providers/configProvider';
import { UtilitiesService } from './utilities.service';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  _viewFields = '<ViewFields>\
                    <FieldRef Name="ID"/>\
                    <FieldRef Name="Title"/>\
                    <FieldRef Name="EventDate"/>\
                    <FieldRef Name="EndDate"/>\
                    <FieldRef Name="EventType0"/>\
                    <FieldRef Name="fRecurrence"/>\
                    <FieldRef Name="fAllDayEvent"/>\
                </ViewFields>';
  _spServicesJsonMapping = {
    ows_ID: {mappedName: 'id', objectType: 'Text'},
    ows_Title: {mappedName: 'title', objectType: 'Text'},
    ows_EventDate: {mappedName: 'eventDate', objectType: 'DateTime'},
    ows_EndDate: {mappedName: 'endDate', objectType: 'DateTime'},
    ows_EventType0: {mappedName: 'eventType', objectType: 'Text'},
    ows_fAllDayEvent: {mappedName: 'isAllDayEvent', objectType: 'Boolean'}
  };
  _defaultOpts = {
    webURL: ConfigProvider.settings.eventsWebURL,
    listName: ConfigProvider.settings.eventsListName,
    spServicesJsonMapping: this._spServicesJsonMapping,
    CAMLViewFields: this._viewFields
  };

  constructor( private httpClient: HttpClient, private utilitiesService: UtilitiesService,
    private spServicesWrapper: SpServicesWrapperService ) { }

  private _reshapeAfterSpServicesJsonMapping(items, startOfSelectedDay) {
    return _.map(items, function(item) {
      item.eventDate = moment(item.eventDate);
      item.endDate = moment(item.endDate);
      item.startedAfterSelectedDate = (item.eventDate > startOfSelectedDay);
      item.endedPriorToSelectedDate = (item.endDate < startOfSelectedDay);
      item.URL = ConfigProvider.settings.eventsWebURL + 'Lists' + ConfigProvider.settings.eventsListName +
        '/DispForm.aspx?ID=' + item.id;
      return item;
    });
  }

  openEvent(event) {
    window.open(ConfigProvider.settings.eventsCalendarURL + '/DispForm.aspx?ID=' + event.id, '_blank');
  }

  getEventsForSelectedDayMultipleViews(start, viewGuids: Array<string>) {
    // Cannot simply pass in a viewName for the list query because we need to add the
    // camlQuery with DateRangesOverlap <Today>, and spServices/SharePoint does not support
    // supplying a viewName and a camlQuery at the same time.

    // Instead, construct the camlQuery by retrieving the view's query and appending the
    // DateRangesOverlap <Today> conditions.  Sometimes views already have the DateRangesOverlaps
    // conditions but they are set to retrieve for the entire month.  Other views don't
    // have the DateRangesOverlaps conditions at all.

    return from(viewGuids).pipe(mergeMap(viewGuid =>
      this.utilitiesService.getView(ConfigProvider.settings.eventsWebURL,
        ConfigProvider.settings.eventsListName, viewGuid as string))).pipe(mergeMap(viewData => {
          let viewQuery = '<Query>' + viewData['d'].ViewQuery + '</Query>';
          if (viewQuery.indexOf('DateRangesOverlap') < 0) {
            viewQuery = viewQuery.replace('<Where>', '\
            <Where>\
              <And>\
                <DateRangesOverlap>\
                  <FieldRef Name="EventDate"/>\
                  <FieldRef Name="EndDate"/>\
                  <FieldRef Name="RecurrenceID"/>\
                  <Value Type="DateTime"><Today/></Value>\
                </DateRangesOverlap>');
            viewQuery = viewQuery.replace('</Where>', '</And></Where>');
          } else {
            viewQuery = viewQuery.replace('<Month />', '<Today/>');
          }
          return this.getEventsForSelectedDay(start, viewQuery);
        }));
  }

  getEventsForSelectedDay(start, query?: string): Promise<any> {
    const camlQuery = query ? query : '<Query>\
                        <Where>\
                            <DateRangesOverlap>\
                              <FieldRef Name="EventDate"/>\
                              <FieldRef Name="EndDate"/>\
                              <FieldRef Name="RecurrenceID"/>\
                              <Value Type="DateTime"><Today/></Value>\
                            </DateRangesOverlap>\
                        </Where>\
                        <OrderBy><FieldRef Name="EventDate" Ascending="TRUE" /></OrderBy>\
                      </Query>';
    const camlQueryOptions = '<QueryOptions>\
                                <CalendarDate>' + start + '</CalendarDate>\
                                <RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion>\
                                <ExpandRecurrence>TRUE</ExpandRecurrence>\
                              </QueryOptions>';
    const queryOpts = $.extend({}, this._defaultOpts, {CAMLQuery: camlQuery, CAMLQueryOptions: camlQueryOptions});
    const self = this;
    const _temp = _;
    return this.spServicesWrapper.executeQuery(queryOpts).then(function(json) {
      const startOfSelectedDay = moment(start).startOf('day');
      json = self._reshapeAfterSpServicesJsonMapping(json, startOfSelectedDay);
      json = _temp.filter(json, {endedPriorToSelectedDate: false});
      return json;
    });
  }

  getNonExpandedEvents(startISO, endISO): Observable<any[]> {
    // Filtering on Calendar lists' EventDate does not seem to work with _api/web/lists.
    // Filtering by date only seems to work with Created, Modified
    // Using legacy REST endpoint instead
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json;odata=verbose'
      })
    };

    return this.httpClient.get(ConfigProvider.settings.eventsWebURL +
      '/_vti_bin/ListData.svc/' + ConfigProvider.settings.eventsListName.replace(/ /g, '') + '?\
        $select=Id,Title,StartTime,EndTime&\
        $orderby=StartTime&$filter=ShowOnHomepage eq true and StartTime ge datetime\'' +
        startISO + '\' and StartTime le datetime\'' + endISO + '\'', httpOptions).pipe(map (resp => {
            const d = resp['d'];
            const results = d['results'];
            return _.chain(results)
              .map(function(item) {
                // format from ListData.svc: "/Date(1495756800000)/"
                item.StartTime = moment(item.StartTime);
                item.EndTime = moment(item.EndTime);
                const startUtc = moment.utc(item.StartTime).startOf('day');
                const endUtc = moment.utc(item.EndTime).startOf('day');
                const isSameDay = startUtc.toString() === endUtc.toString();
                const isSameMonth = startUtc.startOf('month').toString() === endUtc.startOf('month').toString();

                if (isSameDay) {
                  item.friendlyDate = item.StartTime.format('DD MMM').toUpperCase();
                } else if (isSameMonth) {
                  item.friendlyDate = item.StartTime.format('DD') + '-' + item.EndTime.format('DD') + '' +
                    item.StartTime.format('MMM').toUpperCase();
                } else {
                  item.friendlyDate = item.StartTime.format('DD MMM').toUpperCase() + '-' + item.EndTime.format('DD MMM').toUpperCase();
                }
                return item;
              }).value();
          }));

  }
}
