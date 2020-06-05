import { call, put } from 'redux-saga/effects';
import request from 'utils/request';
import { SubmissionError } from 'redux-form/immutable';

import { showAppInfo } from 'containers/App/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { deleteSession } from 'hocs/Session/routines';
import { validationErrors } from 'utils/generic-errors';

import { fetchProfile, editProfile, editPassword, deleteUser } from './routines';

import { profileData, passwordData } from './dataFormat';
const profileFieldMapping = {};
profileData.forEach((field) => {
  profileFieldMapping[field.name] = field.label;
});
const passwordFieldMapping = {};
passwordData.forEach((field) => {
  passwordFieldMapping[field.name] = field.label;
});

// Individual exports for testing

/**
 * Saga to fetch the user profile data
 */
export function* fetchProfileSaga() {
  const { url, options } = yield requestOptions('GET', true, '/users/me');

  try {
    yield put(fetchProfile.request());
    const response = yield call(request, url, options);
    yield put(fetchProfile.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchProfile.failure());
  } finally {
    yield put(fetchProfile.fulfill());
  }
}

/**
 * Saga to update the user profile data
 *
 * @param {immutable map}   payload     The user profile data to store in the backend
 */
export function* editProfileSaga({ payload }) {
  const { url, options } = yield requestOptions('PUT', true, '/users/me', payload);

  try {
    yield put(editProfile.request());
    const response = yield call(request, url, options);
    yield put(editProfile.success(response));
    yield put(showAppInfo({ message: 'Profil-Daten erfolgreich gespeichert' }));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(editProfile.failure(new SubmissionError(validationErrors(err, 'Profil-Daten konnten nicht geändert werden', profileFieldMapping))));
    } else {
      yield put(editProfile.failure(new SubmissionError({ _error: 'Beim Speichern der Profil-Daten ist ein unbekannter Fehler aufgetreten' })));
    }
  } finally {
    yield put(editProfile.fulfill());
  }
}

/**
 * Saga to update the password
 *
 * @param {immutable map}   payload     The password information
 */
export function* editPasswordSaga({ payload }) {
  const { url, options } = yield requestOptions('POST', true, '/users/change-password', payload);

  try {
    yield put(editPassword.request());
    yield call(request, url, options);
    yield put(editPassword.success());
    yield put(showAppInfo({ message: 'Passwort wurde erfolgreich geändert' }));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.statusCode === 400 && err.code === 'INVALID_PASSWORD') {
      yield put(editPassword.failure(new SubmissionError({ _error: 'Passwort konnte nicht geändert werden', oldPassword: 'Ungültig' })));
    } else if (err.name === 'ValidationError') {
      yield put(editPassword.failure(new SubmissionError(validationErrors(err, 'Passwort konnte nicht geändert werden', passwordFieldMapping))));
    } else {
      yield put(editPassword.failure(new SubmissionError({ _error: 'Beim Speichern des neuen Passwortes ist ein unbekannter Fehler aufgetreten' })));
    }
  } finally {
    yield put(editPassword.fulfill());
  }
}

/**
 * Saga to delete the profile
 *
 * @param {immutable map}   payload     The profile information
 */
export function* deleteUserSaga({ payload }) {
  if (payload.get('confirmationUsername') !== payload.get('username')) {
    yield put(deleteUser.failure(new SubmissionError({ confirmationUsername: 'Ungültiger Benutzername' })));
  } else {
    const { url, options } = yield requestOptions('DELETE', true, '/users/me');

    try {
      yield put(deleteUser.request());
      yield call(request, url, options);
      yield put(deleteUser.success());
    } catch (error) {
      yield handleReceiveAppError(error);
      yield put(deleteUser.failure(error));
    }
  }
  yield put(deleteUser.fulfill());
  yield put(deleteSession.trigger());
}

// All sagas to be loaded
export default [
  cancelByLocationChange(fetchProfile.TRIGGER, fetchProfileSaga),
  cancelByLocationChange(editProfile.TRIGGER, editProfileSaga),
  cancelByLocationChange(editPassword.TRIGGER, editPasswordSaga),
  cancelByLocationChange(deleteUser.TRIGGER, deleteUserSaga),
];
