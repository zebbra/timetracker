/*
 *
 * ReportsPage actions
 *
 */

import {
  SET_COMPONENT,
  SET_SELECTED_YEAR,
} from './constants';

export function setComponent({ component }) {
  return {
    type: SET_COMPONENT,
    component,
  };
}

export function setSelectedYear(year) {
  return {
    type: SET_SELECTED_YEAR,
    year,
  };
}
