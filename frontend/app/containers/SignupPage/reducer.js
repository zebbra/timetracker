/*
 *
 * SignupPageReducer
 *
 */

import { fromJS } from 'immutable';

import { SET_COMPONENT } from './constants';
import { createUser, confirmEmail } from './routines';

const initialSession = fromJS({
  component: 'signup',
  uid: undefined,
  error: undefined,
  info: undefined,
});

const initialState = initialSession;

function signupPageReducer(state = initialState, action) {
  switch (action.type) {

    // Handle set component
    case SET_COMPONENT:
      return state
        .set('component', action.component)
        .set('uid', action.uid)
        .set('error', false)
        .set('info', action.info);

    // Handle create user routine
    case createUser.SUCCESS:
      return state
        .set('component', 'signup')
        .set('error', false)
        .set('info', undefined);

    // Handle email confirmation routine
    case confirmEmail.SUCCESS:
      return state
        .set('component', 'signup')
        .set('error', false)
        .set('info', undefined);
    case confirmEmail.FAILURE:
      return state
        .set('component', 'confirm')
        .set('error', true)
        .set('info', undefined);

    default:
      return state;
  }
}

export default signupPageReducer;
