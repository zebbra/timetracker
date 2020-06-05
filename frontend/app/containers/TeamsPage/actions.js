/*
 *
 * TeamsPage actions
 *
 */

import {
  SET_RENDER_COMPONENT,
} from './constants';

export function setRenderComponent(component, team) {
  return {
    type: SET_RENDER_COMPONENT,
    component,
    team,
  };
}
