import { call, put, select } from 'redux-saga/effects';
import request from 'utils/request';
import { find } from 'lodash';
import { browserHistory } from 'react-router';
import { SubmissionError } from 'redux-form/immutable';
import { EMAIL_REGEX } from 'utils/generic-validators';

import { showAppInfo, setOnboarded } from 'containers/App/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';

import { setComponent as setLoginComponent } from './actions';
import { login, verifyUser, requestPasswordReset, passwordReset } from './routines';
import { makeSelectUid, makeSelectToken } from './selectors';

// Access Token expires after 6 months
const FOUR_WEEKS = 60 * 60 * 24 * 7 * 4 * 6;

// Individual exports for testing
export function* loginSaga({ payload }) {
  const body = {
    password: payload.get('password'),
  };

  if (EMAIL_REGEX.test(payload.get('value'))) {
    body.email = payload.get('value');
  } else {
    body.username = payload.get('value');
  }

  body.ttl = FOUR_WEEKS;

  const { url, options } = yield requestOptions('POST', false, '/users/login?include=user', body);
  try {
    yield put(login.request());
    const response = yield call(request, url, options);
    const roles = [];
    if (response.user && response.user.roles) {
      response.user.roles.forEach((role) => {
        roles.push(role.name);
      });
    }

    if (find(response.user.memberships, { isTeamleader: true })) {
      roles.push('teamleader');
    }

    const session = {
      token: response.id,
      username: response.user.username,
      firstName: response.user.firstName,
      lastName: response.user.lastName,
      roles,
      memberships: response.user.memberships,
      rememberMe: payload.get('rememberMe'),
    };

    yield put(login.success(session));

    const employmentsSettings = yield requestOptions('GET', true, '/users/me/employments');
    const employments = yield call(request, employmentsSettings.url, employmentsSettings.options);
    if (!employments.length) {
      yield put(setOnboarded(false));
    } else {
      yield put(setOnboarded(true));
    }

    if (roles.indexOf('teamleader') > -1) {
      const teamsSettings = yield requestOptions('GET', true, '/users/me/teamsForLeader', null);
      const teams = yield call(request, teamsSettings.url, teamsSettings.options);
      session.teams = teams;
      yield put(login.success(session));
    }

    yield call(browserHistory.push, '/');
    yield put(showAppInfo({ message: `Willkommen ${session.username}` }));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true, true);

    if (err.code === 'LOGIN_FAILED') {
      yield put(login.failure(new SubmissionError({ _error: 'Anmeldung fehlgeschlagen' })));
    } else if (err.code === 'LOGIN_FAILED_EMAIL_NOT_VERIFIED') {
      yield put(login.failure(new SubmissionError({ _error: 'Anmeldung fehlgeschlagen. Bitte verifiziere deine Email-Adresse.' })));
      if (err.details.userId) {
        yield put(setLoginComponent({ component: 'verify', uid: err.details.userId }));
      }
    } else {
      yield put(login.failure(new SubmissionError({ _error: 'Anmeldung fehlgeschlagen' })));
    }
  } finally {
    yield put(login.fulfill());
  }
}

export function* verifyUserSaga() {
  const userId = yield select(makeSelectUid());
  const { url, options } = yield requestOptions('POST', true, `/users/${userId}/verify`, null);

  try {
    yield put(verifyUser.request());
    const response = yield call(request, url, options);
    yield put(verifyUser.success(response));
    yield put(showAppInfo({ message: 'Email wurde versendet' }));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    yield put(verifyUser.failure(err));
  } finally {
    yield put(verifyUser.fulfill());
  }
}

export function* requestPasswordResetSaga({ payload }) {
  const { url, options } = yield requestOptions('POST', false, '/users/reset', payload);

  try {
    yield put(requestPasswordReset.request());
    yield call(request, url, options);
    yield put(requestPasswordReset.success());
  } catch (error) {
    yield handleReceiveAppError(error, true, true);
    if (error.statusCode === 404) {
      yield put(requestPasswordReset.failure({ error: 'not found' }));
    } else {
      yield put(requestPasswordReset.failure({ error: 'not send' }));
    }
  } finally {
    yield put(requestPasswordReset.fulfill());
  }
}

export function* passwordResetSaga({ payload }) {
  const token = yield select(makeSelectToken());
  const { url, options } = yield requestOptions('POST', false, `/users/reset-password?access_token=${token}`, payload);
  Object.assign(options.headers, {
    Authorization: token,
  });

  try {
    yield put(passwordReset.request());
    yield call(request, url, options);
    yield put(passwordReset.success());
  } catch (error) {
    yield handleReceiveAppError(error, true, true);
    yield put(passwordReset.failure());
  } finally {
    yield put(passwordReset.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChange(login.TRIGGER, loginSaga),
  cancelByLocationChange(verifyUser.TRIGGER, verifyUserSaga),
  cancelByLocationChange(requestPasswordReset.TRIGGER, requestPasswordResetSaga),
  cancelByLocationChange(passwordReset.TRIGGER, passwordResetSaga),
];
