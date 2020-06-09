/*
 *
 * HolidaysPage reducer
 *
 */

import { fromJS } from 'immutable';
import moment from 'moment-timezone';
import { unionBy, filter } from 'lodash';

import { SET_RENDER_COMPONENT, SET_SELECTED_YEAR } from './constants';
import { fetchHolidays, createHoliday, editHoliday, deleteHoliday } from './routines';

const initialState = fromJS({
  selectedYear: moment().isoWeekYear(),
  holidays: [],
  holiday: fromJS({}),
  renderComponent: 'table',
  loading: false,
});

/* eslint-disable no-param-reassign */
const sanitizeHolidays = (holidays) => holidays.map((holiday) => {
  holiday.date = new Date(holiday.date);
  return holiday;
});
/* eslint-enabel no-param-reassign */

function holidaysPageReducer(state = initialState, action) {
  switch (action.type) {
    // Handle GET
    case fetchHolidays.TRIGGER:
      return state
        .set('loading', true);
    case fetchHolidays.FULFILL:
      return state
        .set('loading', false);
    case fetchHolidays.SUCCESS:
      return state
        .set('holidays', fromJS(sanitizeHolidays(action.payload)));

    // Handle POST and APTH
    case createHoliday.SUCCESS:
    case editHoliday.SUCCESS:
      return state
        .update('holidays', (data) => fromJS(unionBy(sanitizeHolidays([action.payload]), data.toJS(), 'id')));

    // Handle DELETE
    case deleteHoliday.SUCCESS:
      return state
        .update('holidays', (data) => fromJS(filter(data.toJS(), (holiday) => holiday.id !== action.payload.id)));

    // Handle set render component
    case SET_RENDER_COMPONENT:
      return state
        .set('renderComponent', action.component)
        .set('holiday', fromJS(action.holiday));

    // Handle set selected year
    case SET_SELECTED_YEAR:
      return state
        .set('selectedYear', action.year);

    default:
      return state;
  }
}

export default holidaysPageReducer;
