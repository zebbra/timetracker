import { call, put } from 'redux-saga/effects';
import request from 'utils/request';
import { SubmissionError } from 'redux-form/immutable';

import { showAppError, showAppInfo } from 'containers/App/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { validationErrors } from 'utils/generic-errors';

import { setRenderComponent } from './actions';
import { fetchElements, createElement, editElement, deleteElement } from './routines';

import { data } from './dataFormat';
const fieldMapping = {};
data.forEach((field) => {
  fieldMapping[field.name] = field.label;
});


// Individual exports for testing

/**
 * Saga to fetch all dynamic elements from the backend
 */
export function* fetchElementsSaga() {
  const { url, options } = yield requestOptions('GET', true, '/elements?filter[where][type]=dynamic&filter[order]=createdAt', null);

  try {
    const response = yield call(request, url, options);
    yield put(fetchElements.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchElements.failure());
  } finally {
    yield put(fetchElements.fulfill());
  }
}

/**
 * Saga to create a new element and store it in the backend
 *
 * @param {immutable map}   payload     The element to store in the backend
 */
export function* createElementSaga({ payload }) {
  const { url, options } = yield requestOptions('POST', true, '/elements', payload);

  try {
    yield put(createElement.request());
    const response = yield call(request, url, options);
    yield put(createElement.success(response));
    yield put(showAppInfo({ message: `Leistungselement ${response.label} wurde erstellt` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(createElement.failure(new SubmissionError(validationErrors(err, 'Leistungselement konnte nicht erstellt werden', fieldMapping))));
    } else {
      yield put(createElement.failure(new SubmissionError({ _error: 'Beim Erstellen des Leistungselementes ist ein unbekannter Fehler aufgetreten' })));
      yield put(showAppError(err));
    }
  } finally {
    yield put(createElement.fulfill());
  }
}

/**
 * Saga to update an element in the backend
 *
 * @param {immutable map}   payload     The element payload to udpate in the backend
 */
export function* editElementSaga({ payload }) {
  const { url, options } = yield requestOptions('PUT', true, `/elements/${payload.get('id')}`, payload);

  try {
    yield put(editElement.request());
    const response = yield call(request, url, options);
    yield put(editElement.success(response));
    yield put(showAppInfo({ message: `Leistungselement ${response.label} wurde geändert` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(editElement.failure(new SubmissionError(validationErrors(err, 'Leistungselement konnte nicht geändert werden', fieldMapping))));
    } else {
      yield put(editElement.failure(new SubmissionError({ _error: 'Beim Ändern des Leistungselementes ist ein unbekannter Fehler aufgetreten' })));
      yield put(showAppError(err));
    }
  } finally {
    yield put(editElement.fulfill());
  }
}

/**
 * Delete an element in the backend
 *
 * @param {object}    payload     The element to delete
 */
export function* deleteElementSaga({ payload }) {
  const { url, options } = yield requestOptions('DELETE', true, `/elements/${payload.id}`, null);

  try {
    yield put(deleteElement.request());
    yield call(request, url, options);
    yield put(deleteElement.success(payload));
    yield put(showAppInfo({ message: `Leistungselement ${payload.label} wurde gelöscht` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    yield handleReceiveAppError(error);
  } finally {
    yield put(deleteElement.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChange(fetchElements.TRIGGER, fetchElementsSaga),
  cancelByLocationChange(createElement.TRIGGER, createElementSaga),
  cancelByLocationChange(editElement.TRIGGER, editElementSaga),
  cancelByLocationChange(deleteElement.TRIGGER, deleteElementSaga),
];
