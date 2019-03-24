import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable, from, empty } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { SpServicesWrapperService } from './sp-services-wrapper.service';
import { SpRestService } from './sp-rest.service';

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
                    <FieldRef Name="Location"/>\
                </ViewFields>';
  _spServicesJsonMapping = {
    ows_ID: {mappedName: 'ID', objectType: 'Text'},
    ows_Title: {mappedName: 'Title', objectType: 'Text'},
    ows_EventDate: {mappedName: 'StartTime', objectType: 'DateTime'},
    ows_EndDate: {mappedName: 'EndTime', objectType: 'DateTime'},
    ows_EventType0: {mappedName: 'EventType', objectType: 'Text'},
    ows_fAllDayEvent: {mappedName: 'IsAllDayEvent', objectType: 'Boolean'},
    ows_Location: { mappedName: 'Location', objectType: 'Text'}
  };

  constructor( private httpClient: HttpClient, private spRestService: SpRestService,
    private spServicesWrapper: SpServicesWrapperService ) { }

  private _reshapeAfterSpServicesJsonMapping(items, startOfSelectedDay, eventSource) {
    return _.map(items, function(item) {
      item.eventDate = moment(item.eventDate);
      item.endDate = moment(item.endDate);
      item.startedAfterSelectedDate = (item.eventDate > startOfSelectedDay);
      item.endedPriorToSelectedDate = (item.endDate < startOfSelectedDay);
      item.URL = eventSource.listWeb + 'Lists' + eventSource.listName +
        '/DispForm.aspx?ID=' + item.id;
      return item;
    });
  }

  openEvent(event) {
    this.spRestService.getDisplayForm(event.source.listWeb, event.source.listName, event.ID).subscribe(
      formUrl => window.open(formUrl, '_blank')
    );
  }

  getEventsForSelectedDayMultipleViews(start, viewGuids: Array<string>, eventSource) {
    // Cannot simply pass in a viewName for the list query because we need to add the
    // camlQuery with DateRangesOverlap <Today>, and spServices/SharePoint does not support
    // supplying a viewName and a camlQuery at the same time.

    // Instead, construct the camlQuery by retrieving the view's query and appending the
    // DateRangesOverlap <Today> conditions.  Sometimes views already have the DateRangesOverlaps
    // conditions but they are set to retrieve for the entire month.  Other views don't
    // have the DateRangesOverlaps conditions at all.

    return from(viewGuids).pipe(mergeMap(viewGuid =>
      this.spRestService.getView(eventSource.listWeb,
        eventSource.listName, viewGuid as string).pipe(
          catchError(error => {
            console.warn('Could not find view by GUID: ' + viewGuid);
            return empty();
        })))).pipe(mergeMap(viewData => {
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
          return this.getEventsForRange(start, viewQuery);
        }));
  }

  getEventsForRange(start, eventSource, query?: string, recurrenceRange = 'Today'): Observable<any> {
    const camlQuery = query ? query : '<Query>\
                        <Where>\
                            <DateRangesOverlap>\
                              <FieldRef Name="EventDate"/>\
                              <FieldRef Name="EndDate"/>\
                              <FieldRef Name="RecurrenceID"/>\
                              <Value Type="DateTime"><' + recurrenceRange + ' /></Value>\
                            </DateRangesOverlap>\
                        </Where>\
                        <OrderBy><FieldRef Name="EventDate" Ascending="TRUE" /></OrderBy>\
                      </Query>';
    const camlQueryOptions = '<QueryOptions>\
                                <CalendarDate>' + start + '</CalendarDate>\
                                <RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion>\
                                <ExpandRecurrence>TRUE</ExpandRecurrence>\
                              </QueryOptions>';
    const defaultOpts = {
      webURL: eventSource.listWeb,
      listName: eventSource.listName,
      spServicesJsonMapping: this._spServicesJsonMapping,
      CAMLViewFields: this._viewFields
    };
    const queryOpts = $.extend({}, defaultOpts, {CAMLQuery: camlQuery, CAMLQueryOptions: camlQueryOptions});
    const self = this;
    const _temp = _;
    return from(this.spServicesWrapper.executeQuery(queryOpts).then(function(json) {
      const startOfSelectedDay = moment(start).startOf('day');
      // json = self._reshapeAfterSpServicesJsonMapping(json, startOfSelectedDay, eventSource);
      // json = _temp.filter(json, {endedPriorToSelectedDate: false });
      json = _temp.chain(json).map(function(item) {
                item.StartTime = moment(item.StartTime);
                item.EndTime = moment(item.EndTime);
                const startUtc = moment.utc(item.StartTime).startOf('day');
                const endUtc = moment.utc(item.EndTime).startOf('day');
                const isSameDay = startUtc.toString() === endUtc.toString();
                const isSameMonth = startUtc.startOf('month').toString() === endUtc.startOf('month').toString();

                if (isSameDay) {
                  item.friendlyDate = item.StartTime.format('DD MMM').toUpperCase();
                } else if (isSameMonth) {
                  item.friendlyDate = item.StartTime.format('DD') + '-' + item.EndTime.format('DD') + ' ' +
                    item.StartTime.format('MMM').toUpperCase();
                } else {
                  item.friendlyDate = item.StartTime.format('DD MMM').toUpperCase() + '-' + item.EndTime.format('DD MMM').toUpperCase();
                }
        item.source = eventSource;
        return item;
      }).value();
      return json;
    }));
  }

  getNonExpandedEvents(startISO, endISO, eventSource): Observable<any[]> {
    // Filtering on Calendar lists' EventDate does not seem to work with _api/web/lists.
    // Filtering by date only seems to work with Created, Modified
    // Using legacy REST endpoint instead
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json;odata=verbose'
      })
    };

    return this.httpClient.get(eventSource.listWeb +
      '/_vti_bin/ListData.svc/' + eventSource.listName.replace(/ /g, '') + '?\
        $select=Id,Title,StartTime,EndTime,Location&\
        $orderby=StartTime&$filter=StartTime ge datetime\'' +
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
                  item.friendlyDate = item.StartTime.format('DD') + '-' + item.EndTime.format('DD') + ' ' +
                    item.StartTime.format('MMM').toUpperCase();
                } else {
                  item.friendlyDate = item.StartTime.format('DD MMM').toUpperCase() + '-' + item.EndTime.format('DD MMM').toUpperCase();
                }
                item.source = eventSource;
                return item;
              }).value();
          }));

  }
}
