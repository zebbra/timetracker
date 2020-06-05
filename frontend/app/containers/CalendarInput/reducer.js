/*
 *
 * CalendarInput reducer
 *
 */

import { fromJS } from 'immutable';

import { SET_INITIAL_VALUE } from './constants';

const initialState = fromJS({
  initialValue: undefined,
});

function calendarInputReducer(state = initialState, action) {
  switch (action.type) {

    // Handle set initial cell input values
    case SET_INITIAL_VALUE:
      return state
        .set('initialValue', action.value);

    default:
      return state;
  }
}

export default calendarInputReducer;
