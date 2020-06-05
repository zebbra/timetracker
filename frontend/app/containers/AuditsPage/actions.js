
import {
  SET_RENDER_COMPONENT,
  SET_SELECTED_YEAR,
} from './constants';


export function setRenderComponent(component, audit) {
  return {
    type: SET_RENDER_COMPONENT,
    component,
    audit,
  };
}

export function setSelectedYear(year) {
  return {
    type: SET_SELECTED_YEAR,
    year,
  };
}
