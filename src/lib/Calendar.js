import moment from 'moment';
import recur from 'moment-recur';
import _ from 'lodash';

import * as Calendars from '../calendars';
import * as Dates from './Dates';
import * as Utils from './Utils';
import * as Seasons from './Seasons';
import * as Celebrations from './Celebrations';

import { 
  LiturgicalSeasons, 
  Titles, 
  LiturgicalColors, 
  PsalterWeeks, 
  Types,
  Cycles
} from '../constants';

// Get an array of country names
const countries = _.keys(Calendars);

//================================================================================================
// Processing method for calendar config
//================================================================================================

const _getConfig = config => {
  config = _.isPlainObject(config) ? config : _.stubObject();
  config.year = config.year || moment.utc().year();
  config.christmastideEnds = config.christmastideEnds || 'o';
  config.epiphanyOnJan6 = config.epiphanyOnJan6 || _.stubFalse();
  config.corpusChristiOnThursday = config.corpusChristiOnThursday || _.stubFalse();
  config.ascensionOnSunday = config.ascensionOnSunday || _.stubFalse();
  config.country = config.country || _.stubFalse();
  config.locale = config.locale || 'en';
  config.type = config.type || 'calendar';
  config.query = _.isPlainObject( config.query ) ? config.query : null;
  return config;
};

// _.each( Calendars, function( Calendar ) {
//   Calendar.dates( 2015 );
// })


// Return the appropriate national calendar based on the country given
// Returns object with function returning empty array if nothing specified
// country: the country to get the calendar for
const getNationalCalendar = country => {
  if ( country ) {
    if ( _.has( Calendars, country ) ) {
      return Calendars[ country.toLowerCase() ];
    }
    else {
      return Calendars['general'];
    }
  }
  return { dates: () => [] };
};

// Returns the merged national & general calendar dates
// along with key celebrations in the Roman Catholic rite
// Merges the national calendar to the general calendar
// where national calendar dates with the same key as a date
// in the general calendar will take precedence
// options: (see _calendarYear)
const _getCalendar = options => {

  // Get the relevant national calendar object based on the given country
  let national = _.reduce( getNationalCalendar( options.country ).dates( options.year ), ( r, v, k ) => {
    v.source = 'n';
    r[ v.key ] = v;
    return r;
  }, {});


  // Get the general calendar based on the given year and format the result for better processing
  let general = _.reduce( Calendars['general'].dates( options.year ), ( r, v, k ) => {
    v.source = 'g';
    r[ v.key ] = v;
    return r;
  }, {});

  // If the national calendar has the same celebration defined
  // as in the general calendar, it replaces the one
  // in the general calendar
  // If the national calendar date is not in the general
  // calendar, it is added
  _.each( national, ( v, k ) => _.set( general, k, v ));

  // Get the celebration dates based on the given year and options and format the result for better processing
  let celebrations = _.reduce(
    Celebrations.dates( options.year, options.christmastideEnds, options.epiphanyOnJan6, options.corpusChristiOnThursday, options.ascensionOnSunday ),
    ( r, v, k ) => {
      v.source = 'c';
      r[ v.key ] = v;
      return r;
    }, {});

  // If the general calendar has the same celebration defined
  // check if it is prioritized, if not prioritized, it will
  // be overwritten by the incoming celebration date
  _.each( celebrations, ( v, k ) => {
    if ( _.has( general, k ) ) {
      let date = _.get( general, k );
      // if the general date is not prioritized, it will be overwritten
      // by the celebration date
      if ( !_.isUndefined( date.data ) && !date.data.prioritized ) {
        _.set( general, k, v );
      }
    }
    else {
      _.set( general, k, v );
    }
  });

  // Merge coinciding dates based on this logic:
  //
  // Rule 1:
  // celebration dates have the highest priority
  // but if the national calendar has the same date
  // and is prioritized, it can replace the celebration date
  // celebration dates will always override general dates
  // only a national date may override a celebration
  //
  // Rule 2:
  // A national date can override a general date if the general
  // date is not prioritized. However if the general date is
  // prioritized, it will NOT be replaced by a national date that is
  // not prioritized
  // If both are prioritzed, the national date is kept
  //
    // Group dates by their moment values
  let result = _.groupBy( general, v => v.moment.valueOf());

  // Apply replacement logic for coinciding dates
  result = _.map( result, coincidences => {

      // Only run when there's more than 1 date in the group
      if ( coincidences.length > 1 ) {

        // Group coincidences by their source
        let sources = _.groupBy( coincidences, v => v.source );

        // Flag of the date to be retained
        let keep;

        // If the group has a celebration and no national date and no general date
        // Keep the celebration and discard other coincidences
        if ( _.has( sources, 'c' ) && !_.has( sources, 'n') && !_.has( sources, 'g') ) {
          keep = 'c';
        }

        // If the group has a celebration AND national date AND no general date ...
        // Keep national date IF its prioritized
        // else keep the celebration
        else if ( _.has( sources, 'c') && _.has( sources, 'n' ) ) {
          if ( _.head( sources['n'] ).data.prioritized ) {
            keep = 'n';
          }
          else {
            keep = 'c';
          }
        }

        // If the group has a national AND general date but no celebration
        // Keep the general date if its prioritized
        // If not, keep the national date
        else if ( !_.has( sources, 'c') && _.has( sources, 'n' ) && _.has( sources, 'g') ) {
          if ( !_.head( sources['n'] ).data.prioritized && _.head( sources['g'] ).data.prioritized ) {
            keep = 'g';
          }
          else {
            keep = 'n';
          }
        }

        // If the group has multiple general dates only
        // Keep the highest ranking general date
        else if ( !_.has( sources, 'c') && !_.has( sources, 'n' ) && _.has( sources, 'g') ) {
          sources['g'] = _.map( sources, source => {
            return _.minBy( source, function( item ) {
              return _.indexOf( Types, item.type );
            });
          });
          keep = 'g';
        }
      
        // If the group has a celebration and general date but no national date
        // and any other combination, keep the celebration date
        else {
          keep = 'c';
        }

        // Keep only the relevant date
        coincidences = _.filter( coincidences, { source: keep } );

      }

      return coincidences;
  });

  // Flatten the results
  result = _.flatten(result);

  // Remap the keys to be timestamps for better processing
  result = _.reduce(result, ( r, v, k ) => {
    // If the response already has this timestamp
    if ( _.has( r, v.moment.valueOf() ) ) {
      let date = _.get( r, v.moment.valueOf() );
      // If the incoming date has a higher rank than the current date
      if ( _.lt( _.indexOf( Types, v.type ), _.indexOf( Types, date.type ) ) ) {
        // Replace it with the incoming date
        r[ v.moment.valueOf() ] = v;
      }
    }
    else { // Response does not have this timestamp
      r[ v.moment.valueOf() ] = v;
    }
    return r;
  }, {});

  return result;
};

// options: (configuration options)
// dates: (liturgical dates array)
const _applyDates = ( options, dates ) => {

  // Get the merged General and National Calendar dates
  let calendarDates = _getCalendar( options );
  let liturgicalDates = _.reduce( dates, ( r, v, k ) => {
    r[ v.moment.valueOf() ] = v;
    return r;
  }, {});

  dates = _.map( liturgicalDates, (date, timestamp) => {

    if ( _.has( calendarDates, timestamp ) ) {

      let candidate = _.get( calendarDates, timestamp );
      let replace = false;
      let derank = false;

      //------------------------------------------------------------------
      // A celebration date will replace anything
      //------------------------------------------------------------------
      if ( _.eq( candidate.source, 'c' )) {
        replace = true;
      }
      //------------------------------------------------------------------
      // A general or national date needs further processing
      // before replacing something in the liturgical calendar
      //------------------------------------------------------------------
      else {

        //------------------------------------------------------------------
        // A SOLEMNITY will replace any date in the liturgical calendar
        // - solemnity must not override a solemnity in octave of EASTER
        //------------------------------------------------------------------
        if (_.eq( candidate.type, _.head( Types ) ) && _.gt( _.indexOf( Types, date.type ), 0 )) {
          replace = true;
        }

        //------------------------------------------------------------------
        // MEMORIAL or OPT_MEMORIAL that fall on a WEEKDAY
        // in the SEASON OF LENT are reduced to a COMMEMORATION
        //------------------------------------------------------------------
        else if (
          _.eq( date.type, _.last( Types ) )
          && _.eq( date.data.season.key, LiturgicalSeasons.LENT )
          && ( _.eq( candidate.type, Types[5] ) || _.eq( candidate.type, Types[6] ) )
        ) {
          replace = true;
          derank = true;
        }

        //------------------------------------------------------------------
        // MEMORIAL or OPT_MEMORIAL that fall on a WEEKDAY
        // outside LENT or the Easter Octave will replace the general WEEKDAY
        //------------------------------------------------------------------
        else if (
          _.eq( date.type, _.last( Types ) )
          && !_.eq( date.data.season.key, LiturgicalSeasons.LENT )
          && ( _.eq( candidate.type, Types[5] ) || _.eq( candidate.type, Types[6] ) )
        ) {
          replace = true;
        }

        //------------------------------------------------------------------
        // A non prioritized FEAST can only replace WEEKDAY \
        // - weekday must not be in the octave of EASTER
        //------------------------------------------------------------------
        else if (
          _.eq( candidate.type, Types[4] )
          && _.eq( date.type, _.last( Types ) )
          && !_.eq( date.data.season.key, LiturgicalSeasons.LENT )
          && !candidate.data.prioritized
        ) {
          replace = true;
        }

        //------------------------------------------------------------------
        // A FEAST occuring in the season of LENT is deranked
        // to a COMMEMORATION
        //------------------------------------------------------------------
        else if (
          _.eq( candidate.type, Types[4] )
          && _.eq( date.type, _.last( Types ) )
          && _.eq( date.data.season.key, LiturgicalSeasons.LENT )
        ) {
          replace = true;
          derank = true;
        }

        //------------------------------------------------------------------
        // A prioritized FEAST can replace a SUNDAY or WEEKDAY
        // When a Feast of the Lord falls on a SUNDAY it replaces the SUNDAY in Ordinary Time.
        // - weekday must not be in the octave of EASTER
        //------------------------------------------------------------------
        else if (
          _.eq( candidate.type, Types[4] )
          && ( _.eq( date.type, _.last( Types ) ) || _.eq( date.type, Types[1] ) )
          && !_.eq( date.data.season.key, LiturgicalSeasons.LENT )
          && candidate.data.prioritized
        ) {
          replace = true;
        }

        //------------------------------------------------------------------
        // A Sunday can only replace a Sunday
        //------------------------------------------------------------------
        else if (
          _.eq( date.type, Types[1] )
          && _.eq( candidate.type, Types[1] )
        ) {
          replace = true;
        }

        //------------------------------------------------------------------
        // A weekday can only replace a weekday
        // Sundays in Ordinary Time and Chrismastide take precedence over all other celebrations
        // except for SOLEMNITIES and certain FEASTS
        //------------------------------------------------------------------
        else if (
          _.eq( date.type, _.last( Types ) )
          && _.eq( candidate.type, _.last( Types ) )
        ) {
          replace = true;
        }

        // Uncomment to see the dates that from the calendar that were not replaced
        // else {
        //   console.log('not replaced:', candidate.type, candidate.moment.format('L'), candidate.name );
        // }

      }

      if ( replace ) {
        date.key = candidate.key;
        date.name = candidate.name;
        date.source = candidate.source;
        date.type = ( derank ? Types[7] : candidate.type );
        date.data = _.merge({}, date.data, candidate.data );
      }
    }

    return date;

  });

  return dates;
};

//================================================================================================
// Include metadata about the dates in a season of the liturgical year
//================================================================================================
// year
// dates
const _metadata = (year, dates) => {

  // Formula to calculate lectionary cycle (Year A, B, C)
  let firstSundayOfAdvent = Dates.firstSundayOfAdvent(year);
  let thisCycle = ( year - 1963 ) % 3;
  let nextCycle = ( _.eq( thisCycle,  2 ) ? 0 : thisCycle + 1 );

  _.map( dates, v => {

    //=====================================================================
    // LITURGICAL CYCLES
    //---------------------------------------------------------------------
    // If the date is on or after the first sunday of advent
    // it is the next liturgical cycle
    //=====================================================================
    if ( v.moment.isSame( firstSundayOfAdvent ) || v.moment.isAfter( firstSundayOfAdvent ) ) {
      v.data.meta.cycle = {
        key: nextCycle,
        value: Cycles[ nextCycle ]
      };
    }
    else {
      v.data.meta.cycle = {
        key: thisCycle,
        value: Cycles[ thisCycle ]
      };
    }

    return v;
  });

  return dates;
};

//================================================================================================
// METHODS GENERATE THE ROMAN CALENDAR ACCORDING TO CALENDAR
// YEAR OR LITURGICAL YEAR
//================================================================================================

// Returns an object containing dates for the
// days that occur during the calendar year
// c: (an object literal with the following options)
//  [0] year: The year to calculate the liturgical date ranges
//  [1] christmastideEnds: t|o|e (The mode to calculate the end of Christmastide. Defaukts to 'o')
//  [2] epiphanyOnJan6: true|false|undefined (If true, Epiphany will be fixed to Jan 6)
//  [3] corpusChristiOnThursday: true|false|undefined (If true, Corpus Christi is set to Thursday)
//  [4] ascensionOnSunday: true|false|undefined (If true, Ascension is moved to the 7th Sunday of Easter)
//  [5] country: Get national calendar dates for the given country (defaults to unitedStates)
//  [6] type: calendar|liturgical (return dates in either standard calendar or liturgical calendar format)
const _calendarYear = c => {

  // Get the liturgical seasons that run through the year
  let dates = _.union(
    Seasons.christmastide( c.year - 1, c.christmastideEnds, c.epiphanyOnJan6 ),
    Seasons.earlyOrdinaryTime( c.year, c.christmastideEnds, c.epiphanyOnJan6 ),
    Seasons.lent( c.year ),
    Seasons.eastertide( c.year ),
    Seasons.laterOrdinaryTime( c.year ),
    Seasons.advent( c.year ),
    Seasons.christmastide( c.year, c.christmastideEnds, c.epiphanyOnJan6 )
  );

  // console.log(Seasons.lent(c.year));

  // Merge liturgical calendar dates with those from the general & national calendars
  dates = _applyDates( c, dates );
  // Filter dates within the given year only
  dates = _.filter( dates, d => _.eq( d.moment.year(), c.year ));
  dates = _metadata( c.year, dates );

  return dates;
};

// Returns an object containing dates for the
// days that occur during the liturgical year
// c: (an object literal with the following options)
// [0] year: The year to calculate the liturgical date ranges
// [1] christmastideEnds: t|o|e (The mode to calculate the end of Christmastide. Defaukts to 'o')
// [2] epiphanyOnJan6: true|false|undefined (If true, Epiphany will be fixed to Jan 6)
// [3] corpusChristiOnThursday: true|false|undefined (If true, Corpus Christi is set to Thursday)
// [4] ascensionOnSunday: true|false|undefined (If true, Ascension is moved to the 7th Sunday of Easter)
// [5] country: Get national calendar dates for the given country (defaults to unitedStates)
// [6] type: calendar|liturgical (return dates in either standard calendar or liturgical calendar format)
const _liturgicalYear = c => {

  // Get dates for current year
  let thisYear = _calendarYear( c );
  let start = Dates.firstSundayOfAdvent( c.year );

  // Get dates for the following year
  c.year = c.year + 1;
  let nextYear = _calendarYear( c );
  let end = Dates.firstSundayOfAdvent( c.year ); // Last day of liturgical year must be before this date

  let dates = _.union(
    _.filter( thisYear, v => v.moment.isSame( start ) || v.moment.isAfter( start )),
    _.filter( nextYear, v => v.moment.isBefore( end ))
  );

  return dates;
};


// Returns an array of liturgical dates based on the supplied calendar options
// The array may return dates according to the given calendar year or liturgical
// year depending on the options supplied
//
// If query object is passed:
// Return filtered liturgical calendar dates according to the given calendar options
// and filtering options passed in by the user
//
// config: calendar settings
//         if the config object has a query, it will be used to filter the
//         date results returned
//
// skipIsoConversion: undefined|true|false - skip converting moment objects to ISO8601 timestamp
//                    default action converts moment objects to ISO Strings
//
const calendarFor = (config = {}, skipIsoConversion = false ) => {

  // If config is passed as a boolean
  // Then assume that we want the calendar for the current year
  // and either want to skip moment date ISO conversion or keep it
  // depending on the config value is true or false
  if (_.isBoolean(config)) {
    skipIsoConversion = config; 
    config = {};
  }

  // Sanitize incoming config
  config = _getConfig(config);

  // Set the locale information
  Utils.setLocale(config.locale);

  // Get dates based on options
  let dates = _.eq( config.type, 'liturgical') ? _liturgicalYear(config) : _calendarYear(config);

  // Run queries, if any and return the results
  dates = queryFor(dates, config.query);

  // If undefined or false, continue with conversion
  if ( !skipIsoConversion ) {
    Utils.convertMomentObjectToIsoDateString(dates);
  }

  return dates;

};

// Filters an array of dates generated from the calendarFor function based on a given query.
// dates: An array of dates generated from the calendarFor function
// query: An object containing keys to filter the dates by
const queryFor = (dates = [], query = {}) => {

  if (!_.every(dates, _.isObject)) {
    throw 'romcal.queryFor can only accept a single dimenional array of objects';
  }

  //==========================================================================
  // Check if there is a query defined, if none return the unfiltered
  // calendar array
  //==========================================================================
  if (_.isNull(query) || _.isEmpty(query) ) {
    return dates;
  }

  // Reparse dates into moment objects if needed
  dates = Utils.convertIsoDateStringToMomentObject(dates);

  // Months are zero indexed, so January is month 0.
  if ( _.has( query, 'month' ) ) {
    dates = _.filter( dates, d => _.eq( d.moment.month(), _.get( query, 'month' )));
  }

  if ( _.has( query, 'day' ) ) {
    dates = _.filter( dates, d => _.eq( d.moment.day(), _.get( query, 'day' )));
  }
  
  if (_.has( query, 'title' )) {
    dates = _.filter( dates, d => _.includes( d.data.meta.titles, Titles[ _.get( query, 'title' ) ] ));
  }

  if ( _.has( query, 'group' ) ) {
    switch( _.get( query, 'group' ) ) {
      case 'days':
        dates = _.groupBy( dates, d => d.moment.day());
        break;
      case 'months':
        dates = _.groupBy( dates, d => d.moment.month());
        break;
      case 'daysByMonth':
        dates = _.groupBy( dates, d => d.moment.month());
        dates = _.map( dates, v => _.groupBy( v, d => d.moment.day()));
        break;
      case 'weeksByMonth':
        dates = _.groupBy( dates, d => d.moment.month());
        dates = _.map(v => _.groupBy( v, d => d.data.calendar.week ));
        break;
      case 'cycles':
        dates = _.groupBy( dates, d => d.data.meta.cycle.value );
        break;
      case 'types':
        dates = _.groupBy( dates, d => d.type );
        break;
      case 'liturgicalSeasons':
        dates = _.groupBy( dates, d => d.data.season.key );
        break;
      case 'liturgicalColors':
        dates = _.groupBy( dates, d => d.data.meta.liturgicalColor.key );
        break;
      case 'psalterWeek':
        dates = _.groupBy( dates, d => d.data.meta.psalterWeek.key );
        break;
      default:
        break;
    }
  }



  return dates;
};

export {
  calendarFor,
  queryFor,
  countries,
  getNationalCalendar
};
