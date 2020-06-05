/*
 * AppReducer
 *
 */

import { fromJS } from 'immutable';
import config from 'config';
import { LOCATION_CHANGE } from 'react-router-redux';

import { NAVIGATE } from 'containers/Calendar/constants';
import { fetchVersion } from './routines';

import {
  TOGGLE_SIDEBAR_LEFT,
  TOGGLE_SIDEBAR_RIGHT,
  SHOW_APP_ERROR,
  HIDE_APP_ERROR,
  SHOW_APP_INFO,
  HIDE_APP_INFO,
  SET_ONBOARDED,
  TOGGLE_PRINTING,
  RELOAD_AND_UPDATE_VERSION,
} from './constants';

import Pack from '../../../package.json';

// set the api url based on environment
const url = config.api.host;

// The initial state of the App
const initialState = fromJS({
  version: Pack.version,
  latestVersion: Pack.version,
  api: {
    url,
  },
  sidebarLeft: {
    show: false,
  },
  sidebarRight: {
    show: false,
    name: undefined,
  },
  error: {},
  info: {},
  onboarded: true,
  printing: false,
});

function appReducer(state = initialState, action) {
  switch (action.type) {
    // Location change
    case LOCATION_CHANGE:
    case NAVIGATE:
      return state
        .set('sidebarRight', fromJS({ show: false, name: undefined }));

    // App error handling
    case SHOW_APP_ERROR:
      return state
        .set('error', fromJS(action.error));
    case HIDE_APP_ERROR:
      return state
        .set('error', fromJS({}));

    // App info handling
    case SHOW_APP_INFO:
      return state
        .set('info', fromJS(action.info));
    case HIDE_APP_INFO:
      return state
        .set('info', fromJS({}));

    // Sidebar handling
    case TOGGLE_SIDEBAR_LEFT:
      return state
        .updateIn(['sidebarLeft', 'show'], (show) => !show);
    case TOGGLE_SIDEBAR_RIGHT:
      return state
        .updateIn(['sidebarRight', 'show'], (show) => !show)
        .setIn(['sidebarRight', 'name'], action.name);

    // Handle onboarded
    case SET_ONBOARDED:
      return state
        .set('onboarded', action.onboarded);

    // Handle printing
    case TOGGLE_PRINTING:
      return state
        .set('printing', !state.get('printing'));

    case fetchVersion.SUCCESS:
      return state
        .set('latestVersion', action.payload.version);

    case RELOAD_AND_UPDATE_VERSION:
      return state
        .set('version', state.get('latestVersion'));

    default:
      return state;
  }
}

export default appReducer;
