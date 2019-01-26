import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { AfterViewInit } from '@angular/core';
import * as Bloodhound from 'corejs-typeahead';
import { MetricsService } from '../services/metrics.service';
import { ConfigProvider } from '../providers/configProvider';
import * as Handlebars from 'handlebars/dist/handlebars';
import * as url from 'url';
declare function GetUrlKeyValue(key: string, encoded: boolean, url: string): any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements AfterViewInit {
  sources: any[];
  typeaheadInit: any;
  currQuery: {} = {};
  searchSettings: any;
  defaultHeaders: {} =  {
    'Accept': 'application/json;odata=verbose;charset=utf-8',
    'Content-Type': 'application/json;odata=verbose'
  };

  constructor(private metricsService: MetricsService) {}
  private redirectToSharePointSearch() {
    this.metricsService.sendSearchMetrics(this.typeaheadInit.val(), 'Performed SharePoint Search').subscribe();
    window.location.href = this.searchSettings.searchResultsURL + this.typeaheadInit.val();
  }
  // Parse a result from the search service and create a title/value hash table with all the properties available
  private getFields(results) {
    const r = {};
    for (let i = 0; i < results.length; i++) {
      if (results[i] !== undefined && results[i].Key !== undefined) {
        r[results[i].Key] = results[i].Value;
      }
    }
    return r;
  }

  private getSharePointSearchSource(webURL, sourceId) {
    const self = this;
    return new Bloodhound({
      datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: webURL + `/_api/search/query?level=site&sourceid='` +
          sourceId + `'&queryText=`,
        prepare: function(query, settings) {
          settings.url = settings.url + `'` + query + `'`;
          settings.headers = self.defaultHeaders;
          return settings;
        },
        transform: function(response) {
          let results = [];
          // Add Promoted Search Results first
          const secondaryResults = response.d.query.SecondaryQueryResults.results;
          if (secondaryResults.length > 0 && secondaryResults[0].SpecialTermResults) {
            results = results.concat(
              $.map(response.d.query.SecondaryQueryResults.results[0].SpecialTermResults.Results.results, function(result) {
                return { 'Path': result.Url, 'Title': results['Title']};
            }));
          }
          results = results.concat($.map(response.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results, function(result) {
              result = self.getFields(result.Cells.results);
              const imgPath =
                result.FileType !== 'html' && result.FileType != null ? '/_layouts/15/images/ic' + result.FileType + '.png' : null;
              result.ImagePath = imgPath;
              result.Path = result.ServerRedirectedURL ? result.ServerRedirectedURL : result.Path;
              return result;
          }));
          self.currQuery['searchLength'] = results.length;
          return results;
        }
      }
    });
  }

  private getSharePointPeopleSearch(webURL, sourceId) {
    const self = this;
    return new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.nonword,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: webURL + `/_api/search/query?level=site&sourceid='` +
         sourceId + `'&selectproperties='PreferredName,Path'&querytext=`,
        prepare: function(query, settings) {
          settings.url = settings.url + `'` + query + `*'`;
          settings.headers = self.defaultHeaders;
          return settings;
        },
        transform: function(response) {
          const results = $.map(response.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results, function(result) {
            const personResult = self.getFields(result.Cells.results);
            return personResult;
          });
          self.currQuery['peopleSearchLength'] = results.length;
          return results;
        },
        cache: false
      }
    });
  }

  private getOrganizationsSource(webURL, listName) {
    const self = this;
    return new Bloodhound({
      datumTokenizer: function(datum) {
         return Bloodhound.tokenizers.nonword(datum.Title); // use nonword so that strings within parenthesis, like (KM) will be matched
        // return Bloodhound.tokenizers.whitespace(datum.tokens);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: {
        url: webURL +
          `/_api/web/lists/GetByTitle('` + listName + `')/items?$top=1000&$filter=SearchConfigCategory%20eq%20'Organization'`,
        prepare: function(settings) {
          settings.headers = self.defaultHeaders;
          return settings;
        },
        transform: function(response) {
          return $.map(response.d.results, function(result) {
            const enterpriseKeywords = $.map(result.TaxKeyword.results, function(keyword) {
              return keyword.Label;
            });
            const searchKeywords = $.map(result.SearchKeywords.results, function(keyword) {
              return keyword.Label;
            });
            result.tokens = result.Title + ' ; ' + enterpriseKeywords.join(' ; ') + ' ; ' + searchKeywords.join(' ; ');
            return result;
          });
        },
        cache: false // TODO: why do we not get any results when cache turned on?
      }
    });
  }

  private getUsefulLinksSource(webURL, listName) {
    const self = this;
    return new Bloodhound({
      datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.tokens);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: {
        url: webURL +
          `/_api/web/lists/GetByTitle('` + listName + `')/items?$top=1000&$filter=SearchConfigCategory%20eq%20'Suggested Link'`,
        prepare: function(settings) {
          settings.headers = self.defaultHeaders;
          return settings;
        },
        transform: function(response) {
          return $.map(response.d.results, function(result) {
            const enterpriseKeywords = $.map(result.TaxKeyword.results, function(keyword) {
              return keyword.Label;
            });
            const searchKeywords = $.map(result.SearchKeywords.results, function(keyword) {
              return keyword.Label;
            });
            result.tokens = result.Title + ' ; ' + enterpriseKeywords.join(' ; ') + ' ; ' + searchKeywords.join(' ; ');
            return result;
          });
        },
        cache: false // TODO: why do we not get any results when cache turned on?
      }
    });
  }

  private getAcronymSource(webURL, listName) {
    const self = this;
    return new Bloodhound({
      datumTokenizer: function (datum) {
        return Bloodhound.tokenizers.whitespace(datum.tokens);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: {
        url: webURL + `/_api/web/lists/GetByTitle('` + listName + `')/items?$top=2000`,
        prepare: function(settings) {
          settings.headers = self.defaultHeaders;
          return settings;
        },
        transform: function(response) {
          return $.map(response.d.results, function(result) {
            return {
              abbrv: result.Abbreviation_x0020_or_x0020_Acro,
              Title: result.Title,
              tokens: result.Title + ' ' + result.Abbreviation_x0020_or_x0020_Acro
            };
          });
        }
      }
    });
  }

  private getTsrSource(webURL, listName) {
    const self = this;
    return new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: webURL + `/_api/web/lists/GetByTitle('` + listName + `')/items?`,
        prepare: function(query, settings) {
          let queryId = null;
          const queryTokens = Bloodhound.tokenizers.whitespace(query);
          if (queryTokens.length > 1 &&
              queryTokens[0] &&
              queryTokens[0].toUpperCase() === 'TSR' &&
              queryTokens[1].trim().length > 0) {
                queryId = queryTokens[1];
                settings.url = settings.url + `$filter=startswith(ID,'` + queryId + `')`;
          } else {
            // Ignore this query for this source
            settings.url = settings.url + 'isValid=false';
          }
          settings.headers = self.defaultHeaders;
          return settings;
        },
        transform: function(response) {
          const query = ($('.tt-input').val() as string).replace('TSR ', '');
          const results = $.map(response.d.results, function(result) {
            result.Path = webURL + '/Lists/asr/DispForm.aspx?ID=' + result.ID;
            result.HighlightedID = result.ID.toString().replace(query, '<strong>' + query + '</strong>');
            result.val = 'TSR ' + result.ID.toString();
            return result;
          });
          return results;
        },
        transport: function(options, onSuccess, onError) {
          if (GetUrlKeyValue('isValid', false, options.url) !== 'false') {
            $.ajax(options).done(function(data, textStatus, request) {
              onSuccess(data);
            }).fail(function(request, textStatus, errorThrown) { onError(errorThrown); });
          }
        }
      }
    });
  }

  private getIcaoSource(webURL, listName) {
    const self = this;
    return new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: webURL + `/_api/web/lists/GetByTitle('` + listName + `')/items?`,
        prepare: function(query, settings) {
          let queryId = null;
          const queryTokens = Bloodhound.tokenizers.whitespace(query);
          if (queryTokens.length > 1 &&
              queryTokens[0] &&
              queryTokens[0].toUpperCase() === 'ICAO' &&
              queryTokens[1].trim().length > 0) {
                queryId = queryTokens[1];
                settings.url = settings.url + `$filter=startswith(Title,'` + queryId + `')`;
          } else {
            // Ignore this query for this source
            settings.url = settings.url + 'isValid=false';
          }
          settings.headers = self.defaultHeaders;
          return settings;
        },
        transform: function(response) {
          const query = ($('.tt-input').val() as string).replace('ICAO', '');
          const results = $.map(response.d.results, function(result) {
            result.Descriptive = result.Descriptive.toString().replace(query, '<strong>' + query + '</strong>');
            return result;
          });
          return results;
        },
        transport: function(options, onSuccess, onError) {
          if (GetUrlKeyValue('isValid', false, options.url) !== 'false') {
            $.ajax(options).done(function(data, textStatus, request) {
              onSuccess(data);
            }).fail(function(request, textStatus, errorThrown) { onError(errorThrown); });
          }
        }
      }
    });
  }

  ngAfterViewInit() {

    const self = this;
    this.searchSettings = ConfigProvider.settings.search;
    const sources = [];

    for (const source of this.searchSettings.sources) {
      if (source.type === 'Acronyms') {
        sources.push({
          name: source.datasetName,
          display: 'value',
          source: this.getAcronymSource(source.webURL, source.listName),
          templates: {
            empty: `<div style='display:none;'></div>`,
            suggestion: Handlebars.compile(`<div class="result-item">{{abbrv}} - {{Title}}</div>`),
            header: `<h5 class='section-title'>` + source.heading + `</h5>`,
            footer: `<div class='footer'></div>`
          }
        });
      } else if (source.type === 'Organizations') {
        sources.push({
          name: source.datasetName,
          display: 'value',
          source: this.getOrganizationsSource(source.webURL, source.listName),
          templates: {
            empty: `<div style='display:none;'></div>`,
            suggestion: Handlebars.compile(`<div><a href='{{SearchConfigURL.Url}}'>{{Title}}</a></div>`),
            header: `<h5 class='section-title'>` + source.heading + `</h5>`,
            footer: `<div class='footer'></div>`
          }
        });
      } else if (source.type === 'UsefulLinks') {
        sources.push({
          name: source.datasetName,
          display: 'value',
          source: this.getUsefulLinksSource(source.webURL, source.listName),
          templates: {
            empty: `<div style='display:none;'></div>`,
            suggestion: Handlebars.compile(`<div><a href='{{SearchConfigURL.Url}}'>{{Title}}</a></div>`),
            header: `<h5 class='section-title'>` + source.heading + `</h5>`,
            footer: `<div class='footer'></div>`
          }
        });
      } else if (source.type === 'TSR') {
        sources.push({
          name: source.datasetName,
          display: 'value',
          source: this.getTsrSource(source.webURL, source.listName),
          templates: {
            empty: `<div class='empty-message'>Unable to find any TSRs that match the ID</div>`,
            suggestion: Handlebars.compile(`<div><a href='{{Path}}'>{{{HighlightedID}}}</a></div>`),
            header: `<h5 class='section-title'>` + source.heading + `</h5>`,
            footer: `<div class='footer'></div>`
          }
        });
      } else if (source.type === 'Airfield') {
        sources.push({
          name: source.datasetName,
          display: 'value',
          source: this.getIcaoSource(source.webURL, source.listName),
          templates: {
            empty: `<div class='empty-message'>Unable to find any Airfield Locations that match the ICAO</div>`,
            suggestion: Handlebars.compile(`<div>{{{Descriptive}}}</div>`),
            header: `<h5 class='section-title'>` + source.heading + `</h5>`,
            footer: `<div class='footer'></div>`
          }
        });
      } else if (source.type === 'SharepointSearch') {

        sources.push({
          name: source.datasetName,
          display: 'value',
          source: this.getSharePointSearchSource(source.searchSite, source.sourceId),
          templates: {
            empty: `<div style='display:none;'></div>`,
            suggestion: Handlebars.compile(`<div><a href='{{Path}}'>{{#if ImagePath}}
            <img src='{{ImagePath}}'></img>&nbsp;{{/if}}{{Title}}<br/>
              <div class='highlighted-summary'>{{{HitHighlightedSummary}}}</div></a></div></div>`),
            header: `<h5 class='section-title'>` + source.heading + `</h5>`,
            footer: `<div class='footer'></div>`
          }
        });

      } else if (source.type === 'PeopleSearch') {
        sources.push({
          name: source.datasetName,
          display: 'value',
          source: this.getSharePointPeopleSearch(source.searchSite, source.sourceId),
          templates: {
            empty: Handlebars.compile(`<div class='global-footer'><a href='` + this.searchSettings.searchResultsURL +
              `{{query}}' onclick='redirectToSpSearch(); return false;'>View all search results for "{{query}}"</a></div>`),
            suggestion: Handlebars.compile(`<div><a href='{{Path}}'>{{PreferredName}}</a></div>`),
            header: `<h5 class='section-title'>` + source.heading + `</h5>`,
            footer: Handlebars.compile(`<div class='global-footer'><a href='` + this.searchSettings.searchResultsURL +
              `{{query}}' onclick='redirectToSpSearch(); return false;'>View all search results for "{{query}}"</a></div>`)
          }
        });
      }
    }
    // Initialize the typeahead
    this.typeaheadInit = $('.typeahead-input').typeahead({
      hint: true,
      highlight: true,
      minLength: 2
    }, sources);

    let searchTips = `<div class='search-tips' style='display: none'>`;
    searchTips += $(this.searchSettings.searchTipsSelector).html();  // template is on aspx page
    searchTips += `</div>`;

    // Add searchtips after the menu
    $(searchTips).insertAfter('.tt-menu');

    // This event doesn't fire every time the menu opens, it fires the first time you click in the box, even if there is no text
    this.typeaheadInit.on('typeahead:open', function() {
      $('.search-tips').show();
      self.typeaheadInit.one('typeahead:render', function() {
        $('.search-tips').hide();
      });

      // Check if form was auto-completed
      // (for example, clicking back from the search results will populate the input field with the previous value)
      // For some reason cannot turn autocomplete off on the form
      const inputVal = $('.typeahead-input')[1]['value'];
      if (inputVal !== '') {
        // setting typeahead to form autocompleted text
        self.typeaheadInit.typeahead('val', inputVal);
      }
    });

    this.typeaheadInit.focusout(function() {
      $('.search-tips').hide();
    });

    this.typeaheadInit.on('keyup', function(event) {
      if (event.keyCode === 13) {
        self.redirectToSharePointSearch();
      }
    });

    // TODO: Angularize this
    $('.search-link').on('click', function() {
      self.redirectToSharePointSearch();
    });

    // Hack-y way to send metrics, need to find a better approach
    this.currQuery = { spSearchDataset: false, peopleDataset: false };
    this.typeaheadInit.on('typeahead:asyncrequest', function(ev, dataset, query) {
      // Search request is always fired off before people request
      if (dataset === 'peopleDataset') {
        self.currQuery['searchDatasetCompleted'] = false;
        self.currQuery['peopleDatasetCompleted'] = false;
        self.currQuery['searchLength'] = 0;
        self.currQuery['peopleSearchLength'] = 0;
      }
    });

    // Continuing the metrics hacky-ness
    this.typeaheadInit.on('typeahead:asyncreceive', function(ev, dataset, query) {
      self.currQuery[dataset + 'Completed'] = true;
      if (self.currQuery['searchDatasetCompleted'] && self.currQuery['peopleDatasetCompleted']) {
        if (self.currQuery['searchLength'] === 0 && self.currQuery['peopleSearchLength'] === 0) {
          self.metricsService.sendSearchMetrics(self.typeaheadInit.val(), 'No Suggestions').subscribe();
        } else {
          // TODO: Need to troubleshoot the abandoned query metric more
          // Some suggestions returned.  Start a timer and if it fires after 3s (to give user time to review suggestions)
          // then set an event for the delete key or the X button
          /*const delTimeout = setTimeout(function() {
            self.typeaheadInit.one('keydown', function(event) {
              if (event.keyCode === 8 || event.keyCode === 46) {
                self.metricsService.sendMetrics(self.typeaheadInit.val(), 'Abandoned Query').subscribe();
              }
            });
          }, 3000);
          // If a different key is typed, then stop the timer
          self.typeaheadInit.one('input', function(event) {
              clearTimeout(delTimeout);
          });*/
        }
      }
    });

    this.typeaheadInit.on('typeahead:select', function(ev, suggestion, dataset) {
      // User selected a suggestion - send metrics
      // NOTE: had to update corejs.typeahead.js to not clear the input box when an item is selected
      const suggestedUrl = suggestion.SearchConfigURL ? suggestion.SearchConfigURL.Url : suggestion.Path;
      self.metricsService.sendSearchMetrics(self.typeaheadInit.val(), 'Selected Suggestion', dataset, suggestedUrl).subscribe();

      // hide the search tips that displays
      $('.search-tips').hide();
    });

    // This event is fired for all suggestions, which is not great, but  can't find a better event to bind to
    this.typeaheadInit.bind('typeahead:render', function(ev, suggestion, isAsync, dataset) {
      // Limit displayed results to 10 items.  If a dataset has no displayed items, then hide the dataset's heading
      $('.tt-dataset').addClass('hide-title');
      $('.tt-suggestion').removeClass('show');
      $('.tt-suggestion:lt(10)').addClass('show');
      $(`.tt-dataset:has('.tt-suggestion.show')`).removeClass('hide-title');  // hide any datasets with novisible suggestions

      // If no results for any source, hide teh footer
      if ($('.tt-suggestion').length === 0) {
        $('.global-footer').hide();
      } else {
        $('.global-footer').show();
      }

    });
  }

}
