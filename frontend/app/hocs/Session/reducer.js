/*
 *
 * SessionReducer
 *
 */

import { fromJS } from 'immutable';

import { login } from 'containers/LoginPage/routines';

import { deleteSession, impersonate } from './routines';

const initialSession = fromJS({
  token: undefined,
  username: undefined,
  firstName: undefined,
  lastName: undefined,
  roles: [],
  originRoles: [],
  originUsername: undefined,
  memberships: [],
  teams: [],
  rememberMe: undefined,
});

const initialState = initialSession;

function sessionReducer(state = initialState, action) {
  let impersonatedSession;

  switch (action.type) {

    // Session handling
    case login.SUCCESS:
      return fromJS(action.payload);

    // Impersonate handling
    case impersonate.SUCCESS:
      impersonatedSession = Object.assign(action.payload, { _originSession: (state.get('_originSession') || state).toJS() });
      return fromJS(impersonatedSession);

    case deleteSession.SUCCESS:
      return state.get('_originSession') ? state.get('_originSession') : initialSession;

    default:
      return state;
  }
}

export default sessionReducer;
