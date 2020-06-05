import { call, put } from 'redux-saga/effects';
import request from 'utils/request';
import { SubmissionError } from 'redux-form/immutable';
import { browserHistory } from 'react-router';

import { showAppInfo, showAppError } from 'containers/App/actions';
import { setComponent as setLoginComponent } from 'containers/LoginPage/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { validationErrors } from 'utils/generic-errors';

import { createUser, confirmEmail } from './routines';
import { formFields } from './dataFormat';

const fieldMapping = {};
formFields.forEach((field) => {
  fieldMapping[field.name] = field.label;
});

// Individual exports for testing

/**
 * Saga to create a new user
 *
 * @param {immutable map}   payload     The form signup form payload
 */
export function* createUserSaga({ payload }) {
  const { url, options } = yield requestOptions('POST', false, '/users', payload);

  try {
    yield put(createUser.request());
    const response = yield call(request, url, options);
    yield put(createUser.success(response));
    yield put(showAppInfo({ message: `Der Benutzer ${response.username} wurde erstellt` }));
    yield put(setLoginComponent({ component: 'login' }));
    yield call(browserHistory.push, '/login');
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(createUser.failure(new SubmissionError(validationErrors(err, 'Registration fehlgeschlagen', fieldMapping))));
    } else {
      yield put(createUser.failure(new SubmissionError({ _error: 'Bei der Registration ist ein unbekannter Fehler aufgetreten' })));
      yield put(showAppError(err));
    }
  } finally {
    yield put(createUser.fulfill());
  }
}

/**
 * Saga to confirm a user
 *
 * @param {immutable map}   payload     The user confirmation payload
 */
export function* confirmEmailSaga({ payload }) {
  const { url, options } = yield requestOptions('GET', false, '/users/confirm', null, payload);

  try {
    yield put(confirmEmail.request());
    yield call(request, url, options);
    yield put(setLoginComponent({ component: 'login', info: 'Email-Adresse erfolgreich bestätigt. Du kannst dich jetzt mit deinem Benutzername anmelden' }));
    yield call(browserHistory.push, '/login');
  } catch (error) {
    yield handleReceiveAppError(error, true);
    yield put(confirmEmail.failure());
  } finally {
    yield put(confirmEmail.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChange(createUser.TRIGGER, createUserSaga),
  cancelByLocationChange(confirmEmail.TRIGGER, confirmEmailSaga),
];
