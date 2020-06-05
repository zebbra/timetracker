import { createSelector } from 'reselect';

/**
 * Direct selector to the loginPage state domain
 */
const selectLoginPageDomain = (state) => state.get('loginPage');

/**
 * Other specific selectors
 */
const makeSelectUid = () => createSelector(
  selectLoginPageDomain,
  (substate) => substate.get('uid'),
);

const makeSelectComponent = () => createSelector(
  selectLoginPageDomain,
  (substate) => substate.get('component'),
);

const makeSelectError = () => createSelector(
  selectLoginPageDomain,
  (substate) => substate.get('error'),
);

const makeSelectInfo = () => createSelector(
  selectLoginPageDomain,
  (substate) => substate.get('info'),
);

const makeSelectToken = () => createSelector(
  selectLoginPageDomain,
  (substate) => substate.get('token'),
);

/**
 * Default selector used by LoginPage
 */

const makeSelectLoginPage = () => createSelector(
  selectLoginPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectLoginPage;
export {
  makeSelectUid,
  makeSelectComponent,
  makeSelectError,
  makeSelectInfo,
  makeSelectToken,
  selectLoginPageDomain,
};
