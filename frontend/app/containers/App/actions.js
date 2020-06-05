/*
 *
 * App actions
 *
 */

import {
  TOGGLE_SIDEBAR_LEFT,
  TOGGLE_SIDEBAR_RIGHT,
  SHOW_APP_ERROR,
  HIDE_APP_ERROR,
  SHOW_APP_INFO,
  HIDE_APP_INFO,
  SET_ONBOARDED,
  TOGGLE_PRINTING,
  RELOAD_AND_UPDATE_VERSION,
} from './constants';


export function toggleSidebarLeft() {
  return {
    type: TOGGLE_SIDEBAR_LEFT,
  };
}

export function toggleSidebarRight(name) {
  return {
    type: TOGGLE_SIDEBAR_RIGHT,
    name,
  };
}

export function showAppError(error) {
  return {
    type: SHOW_APP_ERROR,
    error,
  };
}

export function hideAppError() {
  return {
    type: HIDE_APP_ERROR,
  };
}

export function showAppInfo(info) {
  return {
    type: SHOW_APP_INFO,
    info,
  };
}

export function hideAppInfo() {
  return {
    type: HIDE_APP_INFO,
  };
}

export function setOnboarded(onboarded) {
  return {
    type: SET_ONBOARDED,
    onboarded,
  };
}

export function togglePrinting() {
  return {
    type: TOGGLE_PRINTING,
  };
}

export function reloadAndUpdateVersion() {
  return {
    type: RELOAD_AND_UPDATE_VERSION,
  };
}
