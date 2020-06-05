import { createSelector } from 'reselect';
import { fromJS } from 'immutable';


/**
 * Direct selectors to the session state domain
 */
const selectSessionDomain = (state) => state.get('session');

/**
 * Other specific selectors
 */
const makeSelectUsername = () => createSelector(
  selectSessionDomain,
  (substate) => substate.get('username'),
);

const makeSelectFirstName = () => createSelector(
  selectSessionDomain,
  (substate) => substate.get('firstName'),
);

const makeSelectLastName = () => createSelector(
  selectSessionDomain,
  (substate) => substate.get('lastName'),
);

const makeSelectRoles = () => createSelector(
  selectSessionDomain,
  (substate) => substate.get('roles') || fromJS([]),
);

const makeSelectOriginRoles = () => createSelector(
  selectSessionDomain,
  (substate) => substate.getIn(['_originSession', 'roles'], fromJS([])),
);

const makeSelectTeams = () => createSelector(
  selectSessionDomain,
  (substate) => substate.getIn(['_originSession', 'teams'], substate.getIn(['teams'], fromJS([]))).toJS()
);

const makeSelectOriginUsername = () => createSelector(
  selectSessionDomain,
  (substate) => substate.getIn(['_originSession', 'username']),
);

const makeSelectToken = (fromOriginSession = false) => createSelector(
  selectSessionDomain,
  (substate) => fromOriginSession ? substate.getIn(['_originSession', 'token'], substate.get('token')) : substate.get('token'),
);

/**
 * Default selector used by Session
 */
const makeSelectSession = () => createSelector(
  selectSessionDomain,
  (substate) => substate,
);

export default makeSelectSession;
export {
  selectSessionDomain,
  makeSelectUsername,
  makeSelectFirstName,
  makeSelectLastName,
  makeSelectRoles,
  makeSelectToken,
  makeSelectOriginRoles,
  makeSelectOriginUsername,
  makeSelectTeams,
};
