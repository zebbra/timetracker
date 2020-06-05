/*
 *
 * SettingsPage actions
 *
 */

import {
  SET_COMPONENT,
  SET_SELECTED_YEAR,
} from './constants';

export function setComponent({ component, record }) {
  return {
    type: SET_COMPONENT,
    component,
    record,
  };
}

export function setSelectedYear(year) {
  return {
    type: SET_SELECTED_YEAR,
    year,
  };
}
