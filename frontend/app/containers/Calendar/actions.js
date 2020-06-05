/*
 *
 * Calendar actions
 *
 */

import {
  NAVIGATE,
  SET_NAVIGATION,
  SELECT_DATE,
} from './constants';


export function setNavigation({ key, shiftKey }) {
  return {
    type: SET_NAVIGATION,
    key,
    shiftKey,
  };
}

export function navigate({ elementId, dayOfWeek, rowIndex, fromStore }) {
  return {
    type: NAVIGATE,
    elementId,
    dayOfWeek,
    rowIndex,
    fromStore,
  };
}

export function selectDate(date) {
  return {
    type: SELECT_DATE,
    date,
  };
}
