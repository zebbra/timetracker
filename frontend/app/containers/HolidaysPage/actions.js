/*
 *
 * HolidaysPage actions
 *
 */

import {
  SET_RENDER_COMPONENT,
  SET_SELECTED_YEAR,
} from './constants';

export function setRenderComponent(component, holiday) {
  return {
    type: SET_RENDER_COMPONENT,
    component,
    holiday,
  };
}

export function setSelectedYear(year) {
  return {
    type: SET_SELECTED_YEAR,
    year,
  };
}
