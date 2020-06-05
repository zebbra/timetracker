/*
 *
 * ElementsPage actions
 *
 */

import {
  SET_RENDER_COMPONENT,
} from './constants';

export function setRenderComponent(component, element) {
  return {
    type: SET_RENDER_COMPONENT,
    component,
    element,
  };
}
