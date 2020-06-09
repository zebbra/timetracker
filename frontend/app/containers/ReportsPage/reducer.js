/*
 *
 * ReportsPage reducer
 *
 */

import { fromJS } from 'immutable';
import moment from 'moment-timezone';

import { SET_COMPONENT, SET_SELECTED_YEAR } from './constants';
import { fetchAllTimeData, fetchAllElementsData, submitManualCorrection } from './routines';

const initialState = fromJS({
  selectedYear: moment().isoWeekYear(),
  indicators: [],
  timeseries: [],
  data: [],
  component: 'time',
  loading: false,
  profile: undefined,
});

function reportsPageReducer(state = initialState, action) {
  let origin;
  let diff = 0;

  switch (action.type) {
    // Handle set component action
    case SET_COMPONENT:
      return state
        .set('component', action.component);

    // Handle GET time data
    case fetchAllTimeData.TRIGGER:
      return state
        .set('loading', true);
    case fetchAllTimeData.FULFILL:
      return state
        .set('loading', false);
    case fetchAllTimeData.SUCCESS:
      return state
        .set('indicators', fromJS(action.payload.indicators))
        .set('timeseries', fromJS(action.payload.timeseries.data))
        .set('data', fromJS([]));

    // Handle GET elemens data
    case fetchAllElementsData.TRIGGER:
      return state
        .set('loading', true);
    case fetchAllElementsData.FULFILL:
      return state
        .set('loading', false);
    case fetchAllElementsData.SUCCESS:
      return state
        .set('indicators', fromJS([]))
        .set('profile', action.payload.reportingPeriod.profile)
        .set('data', fromJS(action.payload.data));
    case fetchAllElementsData.FAILURE:
      return state
        .set('indicators', fromJS([]))
        .set('data', fromJS([]));

    // Handle PUT manual correction
    case submitManualCorrection.SUCCESS:
      return state
        .update('data', (data) => fromJS(data.toJS().map((entry) => {
          if (entry.title === 'Manuelle Korrekturen') {
            origin = entry.data[0][2];
            diff = origin - action.payload.manualCorrection;
            // eslint-disable-next-line no-param-reassign
            entry.data[0][2] = action.payload.manualCorrection;
            // eslint-disable-next-line no-param-reassign
            entry.data[0][4] = action.payload.manualCorrectionDescription;
            return entry;
          } else if (entry.title === 'Finale Zusammenfassung') {
            // eslint-disable-next-line no-param-reassign
            entry.data[0][2] -= diff;
            return entry;
          }
          return entry;
        })));

    // Handle set selected year
    case SET_SELECTED_YEAR:
      return state
        .set('selectedYear', action.year);

    default:
      return state;
  }
}

export default reportsPageReducer;
