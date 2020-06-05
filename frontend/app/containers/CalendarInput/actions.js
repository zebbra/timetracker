/*
 *
 * CalendarInput actions
 *
 */

import {
  SET_INITIAL_VALUE,
} from './constants';


export function setInitialValue(value) {
  return {
    type: SET_INITIAL_VALUE,
    value,
  };
}
