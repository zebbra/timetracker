import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

/**
 * Direct selector to the calendar state domain
 */
const selectCalendarDomain = (state) => state.get('calendar');

/**
 * Other specific selectors
 */
const makeSelectSelectedDate = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('selectedDate'),
);

const makeSelectSelectedCell = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('selectedCell'),
);

const makeSelectNavigation = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('navigation') && substate.get('navigation'),
);

const makeSelectElements = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('elements'),
);

const makeSelectTracks = (weekday) => createSelector(
  selectCalendarDomain,
  (substate) => substate.getIn(['tracks', weekday]) || substate.getIn(['tracks']) || fromJS([]),
);

const makeSelectHolidays = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('holidays'),
);

const makeSelectUserSettings = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('userSettings'),
);

const makeSelectDailyActual = (key) => createSelector(
  selectCalendarDomain,
  (substate) => substate.getIn(['reporting', key, 'dailyActual']),
);

const makeSelectWeeklyActual = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('reporting').reduce((acc, item) => acc + item.get('dailyActual'), 0),
);

const makeSelectWeeklyTarget = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('reporting').reduce((acc, item) => acc + item.get('dailyTarget'), 0),
);

const makeSelectDailyTarget = (key) => createSelector(
  selectCalendarDomain,
  (substate) => substate.getIn(['reporting', key, 'dailyTarget']),
);

const makeSelectRegions = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('regions'),
);

const makeSelectShowWeekendWithTrack = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('showWeekendWithTrack'),
);

const makeSelectDaysPerWeek = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('daysPerWeek'),
);

const makeSelectLoading = () => createSelector(
  selectCalendarDomain,
  (substate) => substate.get('loading'),
);


/**
 * Default selector used by Calendar
 */
const makeSelectCalendar = () => createSelector(
  selectCalendarDomain,
  (substate) => substate,
);

export default makeSelectCalendar;
export {
  selectCalendarDomain,
  makeSelectSelectedDate,
  makeSelectSelectedCell,
  makeSelectNavigation,
  makeSelectElements,
  makeSelectTracks,
  makeSelectHolidays,
  makeSelectUserSettings,
  makeSelectDailyActual,
  makeSelectWeeklyActual,
  makeSelectDailyTarget,
  makeSelectWeeklyTarget,
  makeSelectRegions,
  makeSelectShowWeekendWithTrack,
  makeSelectDaysPerWeek,
  makeSelectLoading,
};
