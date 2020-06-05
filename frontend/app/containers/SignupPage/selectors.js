import { createSelector } from 'reselect';


/**
 * Direct selectors to the signup page state domain
 */
const selectSignupPageDomain = (state) => state.get('signupPage');

/**
 * Other specific selectors
 */
const makeSelectComponent = () => createSelector(
  selectSignupPageDomain,
  (substate) => substate.get('component'),
);

/**
 * Default selector used by ReportsPage
 */
const makeSelectSignupPage = () => createSelector(
  selectSignupPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectSignupPage;
export {
  selectSignupPageDomain,
  makeSelectComponent,
};
