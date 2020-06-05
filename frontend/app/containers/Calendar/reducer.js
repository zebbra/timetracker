/*
 *
 * Calendar reducer
 *
 */

import { fromJS } from 'immutable';
import { flatten, filter, unionBy, head, groupBy, values, mapKeys } from 'lodash';
import moment from 'moment';

import { submitCalendarForm } from 'containers/CalendarInput/routines';
import { prepareElementsReducer, navigate, initializeUserSettings } from './helpers';

import { SELECT_DATE, SET_NAVIGATION, NAVIGATE } from './constants';
import { fetchAllData, editUserSettings, deleteUserSettings } from './routines';

const initialState = () => {
  const state = fromJS({
    selectedCell: {
      elementId: undefined,
      dayOfWeek: undefined,
      rowIndex: undefined,
    },
    selectedDate: moment(),
    navigation: undefined,
    daysPerWeek: 5,
    showWeekendWithTrack: false,
    holidays: [],
    tracks: {},
    regions: [
      { type: 'range' },
      { type: 'dynamic' },
      { type: 'static' },
    ],
    elements: [],
    navigationElements: [],
    userSettings: {
      showWeekend: false,
      elements: {},
    },
    reporting: {},
    loading: false,
  });

  return state;
};

/**
 * Calculates the new selected calendar cell based on the current redux-store state of the calendar.
 * You can pass an array of elements and the number of days for which to calculate the navigation
 * if they haven changed since the last store update.
 *
 * @param {immutable map} state         The current redux-store state of the calendar container
 * @param {array}         elements      The elements for which to calculate the navigation (optional)
 * @param {number}        daysPerWeek   The number of days for which to caluclate the navigation (optional)
 */
const calculateNavigation = (state, elements, daysPerWeek) => navigate(
  elements || state.get('elements').toJS(),
  daysPerWeek || state.get('daysPerWeek'),
  state.get('selectedCell').toJS(),
  state.get('navigation').toJS(),
);

/**
 * Calculates the new date based on the current selected date and the changeWeek indicator
 *
 * @param {date}    selectedDate    The current selected date
 * @param {string}  changeWeek      Can be left or right
 */
const calculateWeek = (selectedDate, changeWeek) => {
  if (changeWeek) {
    if (changeWeek === 'left') {
      return selectedDate.clone().subtract(1, 'week');
    } else if (changeWeek === 'right') {
      return selectedDate.clone().add(1, 'week');
    }
  }
  return selectedDate;
};

function calendarReducer(state = initialState(), action) {
  let elements = null;
  let elementId = null;
  let dayOfWeek = null;
  let changeWeek = null;
  let rowIndex = null;
  let showWeekend = null;
  let showWeekendWithTrack = false;
  let userSettings = null;
  let selectedCell = null;
  let daysPerWeek = 5;
  let key = null;
  let weekday = null;

  switch (action.type) {
    // Handle select date
    case SELECT_DATE:
      return state
        .update('selectedDate', (date) => date.isSame(action.date, 'day') ? date : action.date);

    //  Navigation Handling
    case SET_NAVIGATION:
      return state
        .set('navigation', fromJS({ key: action.key, shiftKey: action.shiftKey }));

    case NAVIGATE:
      // apply the navigation stored in the state
      if (action.fromStore) {
        ({ elementId, dayOfWeek, changeWeek, rowIndex } = calculateNavigation(state));

        // if the week changed, then we only update the selectedDate
        if (changeWeek) {
          return state
            .update('selectedDate', (date) => calculateWeek(date, changeWeek));
        }
      } else {
        ({ elementId, dayOfWeek, rowIndex } = action);
      }

      // otherwise we change the selectedCell
      return state
        .set('selectedCell', fromJS({ elementId, dayOfWeek, rowIndex }))
        .set('navigation', undefined);

    // Handle fetch all data
    case fetchAllData.TRIGGER:
      return state
        .set('loading', true);
    case fetchAllData.FULFILL:
      return state
        .set('loading', false);
    case fetchAllData.SUCCESS:
      // if the user does not have any custom settings for the calendar component
      // then we initialize with the default user settings
      userSettings = head(action.payload.settings);
      if (!userSettings) {
        userSettings = initializeUserSettings(action.payload.elements);
      }

      ({ elements, showWeekend, showWeekendWithTrack } = prepareElementsReducer(
        action.payload.elements,
        action.payload.tracks,
        action.payload.holidays,
        userSettings,
        state.get('selectedDate')
      ));

      // decide how many days per week to display
      daysPerWeek = (showWeekend || showWeekendWithTrack) ? 7 : 5;

      // if there is pending navigation open (in case of week-change) then
      // we apply the navigation here
      if (state.get('navigation')) {
        ({ elementId, dayOfWeek, rowIndex } = calculateNavigation(state, elements, daysPerWeek));
        selectedCell = fromJS({
          elementId,
          dayOfWeek,
          rowIndex,
        });
      } else {
        selectedCell = state.get('selectedCell');
      }

      return state
        .set('selectedCell', selectedCell)
        .set('navigation', undefined)
        .set('userSettings', fromJS(userSettings))
        .set('daysPerWeek', daysPerWeek)
        .set('showWeekendWithTrack', showWeekendWithTrack)
        .set('holidays', fromJS(action.payload.holidays))
        .set('elements', fromJS(elements))
        .set('tracks', fromJS(groupBy(action.payload.tracks, (track) => moment(track.date).weekday())))
        .set('reporting', fromJS(mapKeys(action.payload.reporting, (value, weekdayKey) => moment(weekdayKey, 'YYYYMMDD').weekday())));

    // Handle calendar form submit routine
    case submitCalendarForm.SUCCESS:
      key = Object.keys(action.payload.reporting)[0];
      weekday = moment(key, 'YYYYMMDD').weekday();

      switch (action.payload.action) {
        case 'DELETE':
          return state
            .updateIn(['reporting', weekday.toString()], () => fromJS(action.payload.reporting[key]))
            .updateIn(['tracks', weekday.toString()], (data) => fromJS(filter(((data && data.toJS()) || []), (track) => track.id !== action.payload.id)));
        case 'POST':
        case 'PUT':
          return state
            .updateIn(['reporting', weekday.toString()], () => fromJS(action.payload.reporting[key]))
            .updateIn(['tracks', weekday.toString()], (data) => fromJS(unionBy(action.payload.tracks, (data && data.toJS()) || [], 'id')));

        default: return state;
      }

    // handle edit user settings routine
    case editUserSettings.TRIGGER:
      return state
        .set('loading', true);
    case editUserSettings.FULFILL:
      return state
        .set('loading', false);
    case editUserSettings.SUCCESS:
      ({ elements, showWeekend, showWeekendWithTrack } = prepareElementsReducer(
        state.get('elements').toJS(),
        flatten(values(state.get('tracks').toJS())),
        state.get('holidays').toJS(),
        action.payload,
        state.get('selectedDate')
      ));

      return state
        .set('userSettings', fromJS(action.payload))
        .set('daysPerWeek', showWeekend ? 7 : 5)
        .set('showWeekendWithTrack', showWeekendWithTrack)
        .set('elements', fromJS(elements));

    case deleteUserSettings.TRIGGER:
      return state
        .set('loading', true);
    case deleteUserSettings.FULFILL:
      return state
        .set('loading', false);
    case deleteUserSettings.SUCCESS:
      ({ elements, showWeekend, showWeekendWithTrack } = prepareElementsReducer(
        state.get('elements').toJS(),
        flatten(values(state.get('tracks').toJS())),
        state.get('holidays').toJS(),
        {
          showWeekend: false,
          elements: {},
        },
        state.get('selectedDate')
      ));

      return state
        .set('userSettings', fromJS({
          showWeekend: false,
          elements: {},
        }))
        .set('daysPerWeek', showWeekend ? 7 : 5)
        .set('showWeekendWithTrack', showWeekendWithTrack)
        .set('elements', fromJS(elements));

    default:
      return state;
  }
}

export default calendarReducer;
