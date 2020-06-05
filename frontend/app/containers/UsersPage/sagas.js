import { call, put } from 'redux-saga/effects';
import request from 'utils/request';
import { SubmissionError } from 'redux-form/immutable';
import { pick } from 'lodash';

import { showAppError, showAppInfo } from 'containers/App/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { validationErrors } from 'utils/generic-errors';

import { setRenderComponent } from './actions';
import { fetchUsers, editUser } from './routines';

import { data } from './dataFormat';
const fieldMapping = {};
data.forEach((field) => {
  fieldMapping[field.name] = field.label;
});

export function* fetchUsersSaga() {
  const { url, options } = yield requestOptions('GET', true, '/users', null);

  try {
    yield put(fetchUsers.request());
    const users = yield call(request, url, options);
    yield put(fetchUsers.success(users));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchUsers.failure());
  } finally {
    yield put(fetchUsers.fulfill());
  }
}

export function* editUserSaga({ payload }) {
  const user = pick(payload.toJS(), ['id', 'firstName', 'lastName', 'username', 'email']);
  user.emailVerified = true;
  const { url, options } = yield requestOptions('PUT', true, `/users/${user.id}`, user);

  try {
    yield put(editUser.request());
    const response = yield call(request, url, options);
    yield put(editUser.success(response));
    yield put(showAppInfo({ message: `Benutzer ${response.username} wurde geändert` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(editUser.failure(new SubmissionError(validationErrors(err, 'Benutzer konnte nicht geändert werden', fieldMapping))));
    } else {
      yield put(editUser.failure(new SubmissionError({ _error: 'Beim Ändern des Benutzers ist ein unbekannter Fehler aufgetreten' })));
      yield put(showAppError(err));
    }
  } finally {
    yield put(editUser.fulfill());
  }
}

export default [
  cancelByLocationChange(fetchUsers.TRIGGER, fetchUsersSaga),
  cancelByLocationChange(editUser.TRIGGER, editUserSaga),
];
