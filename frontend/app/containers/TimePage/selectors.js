import { createSelector } from 'reselect';

/**
 * Direct selector to the timePage state domain
 */
const selectTimePageDomain = (state) => state.get('timePage');

/**
 * Other specific selectors
 */

/**
 * Default selector used by HolidaysPage
 */
const makeSelectTimePage = () => createSelector(
  selectTimePageDomain,
  (substate) => substate.toJS()
);

export default makeSelectTimePage;
export {
  selectTimePageDomain,
};
