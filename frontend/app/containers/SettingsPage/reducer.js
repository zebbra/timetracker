/*
 *
 * SettingsPage reducer
 *
 */

import { fromJS } from 'immutable';
import moment from 'moment-timezone';
import { unionBy, filter } from 'lodash';

import { SET_COMPONENT, SET_SELECTED_YEAR } from './constants';
import {
  fetchAllEmploymentData,
  initializeProfile,
  fetchAllElementsData,
  submitProfile,
  submitElement,
  createEmployment,
  editEmployment,
  deleteEmployment,
} from './routines';
import { merge, update, remove } from './helpers';

const initialProfile = {
  plannedVacations: 0,
  plannedMixed: 0,
  plannedQuali: 0,
  plannedPremiums: 0,
  transferTotalLastYear: 0,
  transferOvertime: 0,
  transferGrantedVacations: 0,
  transferGrantedOvertime: 0,
  closed: false,
};

const initialState = fromJS({
  selectedYear: moment().isoWeekYear(),
  component: 'employment',
  elements: [],
  employments: [],
  record: {},
  profile: initialProfile,
  loading: false,
});

/* eslint-disable no-param-reassign */
const sanitizeEmployments = (employments) => employments.map((employment) => {
  employment.start = new Date(employment.start);
  if (employment.end) {
    employment.end = new Date(employment.end);
  }
  return employment;
});
/* eslint-enabel no-param-reassign */

function settingsPageReducer(state = initialState, action) {
  switch (action.type) {
    // Handle set component action
    case SET_COMPONENT:
      return state
        .set('component', action.component)
        .set('record', action.record);

    // Handle set selected year
    case SET_SELECTED_YEAR:
      return state
        .set('selectedYear', action.year);

    // Handle GET employment
    case fetchAllEmploymentData.TRIGGER:
      return state
        .set('loading', true);
    case fetchAllEmploymentData.FULFILL:
      return state
        .set('loading', false);
    case fetchAllEmploymentData.SUCCESS:
      return state
        .set('profile', fromJS(action.payload.profile || initialProfile))
        .set('employments', fromJS(sanitizeEmployments(action.payload.employments)));

    case fetchAllEmploymentData.FAILURE:
      return state
        .set('profile', fromJS(initialProfile));

    // Handle initialize profile
    case initializeProfile.SUCCESS:
      return state
        .set('profile', fromJS(action.payload));

    // Handle GET elements
    case fetchAllElementsData.TRIGGER:
      return state
        .set('loading', true);
    case fetchAllElementsData.FULFILL:
      return state
        .set('loading', false);
    case fetchAllElementsData.SUCCESS:
      return state
        .set('elements', fromJS(merge(action.payload)));

    case fetchAllElementsData.FAILEURE:
      return state
        .set('elements', fromJS([]));

    // Handle submit profile form
    case submitProfile.SUCCESS:
      return state
        .set('profile', action.payload);

    case submitProfile.FAILURE:
      return state;

    // Handle submit element form
    case submitElement.SUCCESS:
      switch (action.payload.action) {
        case 'DELETE':
          return state
            .update('elements', (data) => fromJS(remove(data.toJS(), action.payload.id)));
        default:
          return state
            .update('elements', (data) => fromJS(update(data.toJS(), action.payload.setpoint)));
      }

    // Handle POST and PUT employments
    case createEmployment.SUCCESS:
    case editEmployment.SUCCESS:
      return state
        .update('employments', (data) => fromJS(unionBy(sanitizeEmployments([action.payload]), data.toJS(), 'id')));

    // Handle DELETE
    case deleteEmployment.SUCCESS:
      return state
        .update('employments', (data) => fromJS(filter(data.toJS(), (employment) => employment.id !== action.payload.id)));

    default:
      return state;
  }
}

export default settingsPageReducer;
