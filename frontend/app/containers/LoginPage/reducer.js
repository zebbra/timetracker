/*
 *
 * LoginPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  SET_COMPONENT,
} from './constants';
import {
  login,
  verifyUser,
  requestPasswordReset,
  passwordReset,
} from './routines';

const initialState = fromJS({
  component: 'login',
  uid: undefined,
  error: undefined,
  info: undefined,
  token: undefined,
});

function loginPageReducer(state = initialState, action) {
  switch (action.type) {

    case SET_COMPONENT:
      return state
        .set('component', action.component)
        .set('uid', action.uid)
        .set('error', undefined)
        .set('info', action.info)
        .set('token', action.token);

    case login.SUCCESS:
      return state
        .set('component', 'login')
        .set('uid', undefined)
        .set('error', undefined)
        .set('info', undefined)
        .set('token', undefined);

    case login.FAILURE:
      return state
        .set('component', 'login')
        .set('uid', undefined)
        .set('error', undefined)
        .set('info', undefined)
        .set('token', undefined);

    case verifyUser.SUCCESS:
      return state
        .set('component', 'login')
        .set('uid', undefined)
        .set('error', undefined)
        .set('info', action.payload.info)
        .set('token', undefined);

    case verifyUser.FAILURE:
      return state
        .set('component', 'login')
        .set('uid', undefined)
        .set('error', 'Es gab ein Problem beim Versenden der Email. Versuche es etwas später erneut.')
        .set('info', action.payload.info)
        .set('token', undefined);

    case requestPasswordReset.SUCCESS:
      return state
        .set('component', 'login')
        .set('uid', undefined)
        .set('error', undefined)
        .set('info', 'Passwort-Reset Email wurde versendet.')
        .set('token', undefined);

    case requestPasswordReset.FAILURE:
      return state
        .set('uid', undefined)
        .set('error', action.payload.error === 'not found' ? 'Email-Adresse wurde nicht gefunden' : 'Es gab ein Problem beim Versenden der Email. Versuche es etwas später erneut.')
        .set('info', undefined)
        .set('token', undefined);

    case passwordReset.SUCCESS:
      return state
        .set('component', 'login')
        .set('uid', undefined)
        .set('error', undefined)
        .set('info', 'Passwort erfolgreich zurückgesetzt.')
        .set('token', undefined);

    case passwordReset.FAILURE:
      return state
        .set('uid', undefined)
        .set('error', 'Es gab ein Problem beim Ändern des Passwortes. Versuche es etwas später erneut.')
        .set('info', undefined);

    default:
      return state;
  }
}

export default loginPageReducer;
