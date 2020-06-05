import request from 'utils/request';
import { put, call, takeLatest, select } from 'redux-saga/effects';
import { browserHistory } from 'react-router';

import { showAppError, showAppInfo } from 'containers/App/actions';
import { fetchVersion } from 'containers/App/routines';
import { makeSelectToken } from 'hocs/Session/selectors';
import { requestOptions, handleReceiveAppError } from 'utils/generic-sagas';

import { deleteSession, impersonate } from './routines';


/**
 * Removes the `state` from the `local-storage`
 */
function removeState() {
  try {
    localStorage.removeItem('state');
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches the `state` from the `local-storage`
 */
function getState() {
  try {
    return JSON.parse(localStorage.getItem('state'));
  } catch (error) {
    throw error;
  }
}

// Individual exports for testing

/**
 * Saga to clean up the `local-storage`
 */
export function* cleanUpLocalStorage() {
  try {
    yield call(removeState);

    const state = yield call(getState);
    if (state && 'session' in state) {
      const fakeResponse = {
        status: 'Internal',
        statusText: 'State exists',
      };
      const error = new Error(fakeResponse.statusText);
      error.response = fakeResponse;
      yield put(showAppError(error));
    }
  } catch (error) {
    yield put(showAppError(error));
  }
}

/**
 * Saga to delete the `session` from the redux-store
 */
export function* deleteSessionSaga() {
  const token = yield select(makeSelectToken());

  if (token) {
    const { url, options } = yield requestOptions('POST', true, `/users/logout?access_token=${token}`, null);
    try {
      yield put(deleteSession.request());
      yield call(request, url, options);
      yield put(deleteSession.success());
    } catch (error) {
      // we always trigger success to delete the token in the local storage
      yield put(deleteSession.success());
    } finally {
      yield put(deleteSession.fulfill());
      yield call(browserHistory.push, '/login');
    }
  } else {
    yield put(deleteSession.fulfill());
    yield call(browserHistory.push, '/login');
  }
}

/**
 * Saga to impersonate another user
 *
 * @param {object}    payload   the user to impersonate
 */
export function* impersonateSaga({ payload }) {
  const { url, options } = yield requestOptions('POST', true, '/users/me/impersonate', { userId: payload.userId }, null, true);

  try {
    yield put(impersonate.request());
    const response = yield call(request, url, options);
    const targetUserSession = {
      token: response.token.id,
      username: response.username,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: ['user', 'impersonated'],
      memberships: response.memberships,
      rememberMe: false,
    };
    yield put(showAppInfo({ message: `Angemeldet als ${targetUserSession.username}` }));
    yield put(impersonate.success(targetUserSession));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(impersonate.failure());
  } finally {
    yield put(impersonate.fulfill());
  }
}

export function* fetchVersionSaga() {
  const { url, options } = yield requestOptions('GET', false, '/frontend-version');

  try {
    yield put(fetchVersion.request());
    const response = yield call(request, url, options);
    yield put(fetchVersion.success(response));
  } catch (error) {
    yield put(fetchVersion.failure());
  } finally {
    yield put(fetchVersion.fulfill());
  }
}

// watchers
export function* watchDeleteSession() {
  yield takeLatest(deleteSession.TRIGGER, deleteSessionSaga);
  yield takeLatest(deleteSession.TRIGGER, cleanUpLocalStorage);
}

export function* watchImpersonate() {
  yield takeLatest(impersonate.TRIGGER, impersonateSaga);
}

export function* watchFetchVersion() {
  yield takeLatest(fetchVersion.TRIGGER, fetchVersionSaga);
}
