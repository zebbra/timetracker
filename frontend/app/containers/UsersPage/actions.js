import {
  SET_RENDER_COMPONENT,
} from './constants';

export function setRenderComponent(component, user) {
  return {
    type: SET_RENDER_COMPONENT,
    component,
    user,
  };
}
