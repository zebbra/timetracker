/*
 *
 * TimePage reducer
 *
 */

import { fromJS } from 'immutable';

import { fetchReporting } from './routines';

const initialState = fromJS({
  reporting: [],
});


function timePageReducer(state = initialState, action) {
  switch (action.type) {
    // Handle GET reporting
    case fetchReporting.SUCCESS:
      return state
        .set('reporting', fromJS(action.payload));

    default:
      return state;
  }
}

export default timePageReducer;
