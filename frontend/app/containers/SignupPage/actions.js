/*
 *
 * SignupPage actions
 *
 */

import {
  SET_COMPONENT,
} from './constants';

export function setComponent({ component, uid, error, info }) {
  return {
    type: SET_COMPONENT,
    component,
    uid,
    error,
    info,
  };
}

