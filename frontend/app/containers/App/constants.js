/*
 * AppConstants
 * Each action has a corresponding type, which the reducer knows and picks up on.
 * To avoid weird typos between the reducer and the actions, we save them as
 * constants here. We prefix them with 'yourproject/YourComponent' so we avoid
 * reducers accidentally picking up actions they shouldn't.
 *
 * Follow this format:
 * export const YOUR_ACTION_CONSTANT = 'yourproject/YourContainer/YOUR_ACTION_CONSTANT';
 */

export const DEFAULT_LOCALE = 'de';
export const TOGGLE_SIDEBAR_LEFT = 'app/App/TOGGLE_SIDEBAR_LEFT';
export const TOGGLE_SIDEBAR_RIGHT = 'app/App/TOGGLE_SIDEBAR_RIGHT';
export const SHOW_APP_ERROR = 'app/App/SHOW_APP_ERROR';
export const HIDE_APP_ERROR = 'app/App/HIDE_APP_ERROR';
export const SHOW_APP_INFO = 'app/App/SHOW_APP_INFO';
export const HIDE_APP_INFO = 'app/App/HIDE_APP_INFO';
export const SET_ONBOARDED = 'app/App/SET_ONBOARDED';
export const TOGGLE_PRINTING = 'app/App/TOGGLE_PRINTING';
export const RELOAD_AND_UPDATE_VERSION = 'app/APP/RELOAD_AND_UPDATE_VERSION';
