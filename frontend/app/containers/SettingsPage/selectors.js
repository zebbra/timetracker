import { createSelector } from 'reselect';

/**
 * Direct selector to the settingsPage state domain
 */
const selectSettingsPageDomain = (state) => state.get('settingsPage');

/**
 * Other specific selectors
 */
const makeSelectSelectedYear = () => createSelector(
  selectSettingsPageDomain,
  (substate) => substate.get('selectedYear'),
);

/**
 * Default selector used by SettingsPage
 */
const makeSelectSettingsPage = () => createSelector(
  selectSettingsPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectSettingsPage;
export {
  selectSettingsPageDomain,
  makeSelectSelectedYear,
};
