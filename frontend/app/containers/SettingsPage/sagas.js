import { all, call, put, select } from 'redux-saga/effects';
import request from 'utils/request';
import moment from 'moment-timezone';
import { SubmissionError } from 'redux-form/immutable';

import { showAppInfo, setOnboarded } from 'containers/App/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { isClosedYear } from 'utils/generic-validators';

import { setComponent } from './actions';

import {
  fetchAllEmploymentData,
  initializeProfile,
  fetchAllElementsData,
  submitProfile,
  submitElement,
  createEmployment,
  editEmployment,
  deleteEmployment,
} from './routines';
import { makeSelectSelectedYear } from './selectors';

import { data } from './dataFormat';
const fieldMapping = {};
data.forEach((field) => {
  fieldMapping[field.name] = field.label;
});


// Individual exports for testing

/**
 * Saga to create a new employment and store it in the backend
 *
 * @param {immutable map}   payload     The employment to store in the backend
 */
export function* createEmploymentSaga({ payload }) {
  const { url, options } = yield requestOptions('POST', true, '/employments', payload);

  try {
    yield put(createEmployment.request());
    const response = yield call(request, url, options);
    yield put(createEmployment.success(response));
    yield put(setComponent({ component: 'employment', record: {} }));
    yield put(showAppInfo({ message: 'Arbeitspensum erfolgreich erstellt' }));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(createEmployment.failure(new SubmissionError({ _error: 'Das Startdatum oder das Enddatum ist ungültig' })));
    } else {
      yield put(createEmployment.failure(new SubmissionError({ _error: 'Beim Erstellen des Arbeitspensums ist ein unbekannter Fehler aufgetreten' })));
    }
  } finally {
    yield put(createEmployment.fulfill());
    yield put(setOnboarded(true));
  }
}

/**
 * Saga to update an employment in the backend
 *
 * @param {immutable map}   payload     The employment payload to udpate in the backend
 */
export function* editEmploymentSaga({ payload }) {
  const { url, options } = yield requestOptions('PUT', true, `/employments/${payload.get('id')}`, payload);

  try {
    yield put(editEmployment.request());
    const response = yield call(request, url, options);
    yield put(editEmployment.success(response));
    yield put(setComponent({ component: 'employment', record: {} }));
    yield put(showAppInfo({ message: 'Arbeitspensum erfolgreich geändert' }));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(editEmployment.failure(new SubmissionError({ _error: 'Das Startdatum oder das Enddatum ist ungültig' })));
    } else {
      yield put(editEmployment.failure(new SubmissionError({ _error: 'Beim Ändern des Arbeitspensums ist ein unbekannter Fehler aufgetreten' })));
    }
  } finally {
    yield put(editEmployment.fulfill());
  }
}

/**
 * Delete an employment in the backend
 *
 * @param {object}    payload     The employment to delete
 */
export function* deleteEmploymentSaga({ payload }) {
  const { url, options } = yield requestOptions('DELETE', true, `/employments/${payload.id}`, null);

  try {
    yield put(deleteEmployment.request());
    yield call(request, url, options);
    yield put(deleteEmployment.success(payload));
    yield put(showAppInfo({ message: 'Arbeitspensum erfolgreich gelöscht' }));
  } catch (error) {
    yield handleReceiveAppError(error);
  } finally {
    yield put(deleteEmployment.fulfill());
  }
}

/**
 * Saga to create the initial profile for the currently selected year
 */
export function* initializeProfileSaga() {
  const year = yield select(makeSelectSelectedYear());
  const { url, options } = yield requestOptions('POST', true, '/employment-profiles/initialize', { year });

  try {
    yield put(initializeProfile.request());
    const response = yield call(request, url, options);
    yield put(initializeProfile.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(initializeProfile.failure());
  } finally {
    yield put(initializeProfile.fulfill());
  }
}

/**
 * Saga to fetch all employment data for the selected year
 */
export function* fetchAllEmploymentDataSaga() {
  const year = yield select(makeSelectSelectedYear());

  const profilesQuery = JSON.stringify({ where: { year } });

  const profilesSettings = yield requestOptions('GET', true, `/users/me/employment-profiles?filter=${profilesQuery}`);
  const employmentsSettings = yield requestOptions('GET', true, '/users/me/employments');

  try {
    yield put(fetchAllEmploymentData.request());

    const [profiles, employments] = yield all([
      call(request, profilesSettings.url, profilesSettings.options),
      call(request, employmentsSettings.url, employmentsSettings.options),
    ]);

    if (profiles.length === 0 && !isClosedYear(year)) {
      yield put(initializeProfile.trigger());
    }
    yield put(fetchAllEmploymentData.success({ profile: profiles[0], employments }));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchAllEmploymentData.failure());
  } finally {
    yield put(fetchAllEmploymentData.fulfill());
  }
}

/**
 * Saga to fetch all elements valid for the selected year
 */
export function* fetchAllElementsDataSaga() {
  const selectedYear = yield select(makeSelectSelectedYear());
  const startOfYear = moment().isoWeekYear(selectedYear).startOf('year').toISOString();
  const endOfYear = moment().isoWeekYear(selectedYear).endOf('year').toISOString();

  const elementsQuery = JSON.stringify({
    where: {
      and: [
        { start: { lte: endOfYear } },
        { or: [{ end: null }, { end: { gte: startOfYear } }] },
        { type: 'dynamic' },
      ],
    },
    order: 'project DESC',
  });

  const setpointsQuery = JSON.stringify({
    where: {
      year: selectedYear,
    },
  });

  const reportingQuery = JSON.stringify({
    where: {
      start: startOfYear,
      end: endOfYear,
      type: 'elements',
    },
  });

  const elementsSettings = yield requestOptions('GET', true, `/elements?filter=${elementsQuery}`);
  const setpointsSettings = yield requestOptions('GET', true, `/users/me/setpoints?filter=${setpointsQuery}`);
  const reportingSettings = yield requestOptions('GET', true, `/elements/reporting?filter=${reportingQuery}`);

  try {
    yield put(fetchAllElementsData.request());
    const [elements, setpoints, reporting] = yield all([
      call(request, elementsSettings.url, elementsSettings.options),
      call(request, setpointsSettings.url, setpointsSettings.options),
      call(request, reportingSettings.url, reportingSettings.options),
    ]);
    yield put(fetchAllElementsData.success({ elements, setpoints, reporting }));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchAllElementsData.failure());
  } finally {
    yield put(fetchAllElementsData.fulfill());
  }
}

/**
 * Saga to submit a profile value and store it in the backend
 *
 * @param {object}    payload     The value to store in the backend
 */
export function* submitProfileSaga({ payload }) {
  const { url, options } = yield requestOptions('PUT', true, `/employment-profiles/${payload.id}`, payload);

  try {
    yield put(submitProfile.request());
    const response = yield call(request, url, options);
    yield put(submitProfile.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(submitProfile.failure(payload));
  } finally {
    yield put(submitProfile.fulfill());
  }
}

/**
 * Saga to submit a setpoint for a specific element and store it in the backend
 *
 * @param {object}   payload     The value to store in the backend
 */
export function* submitElementSaga({ payload }) {
  const value = payload.value;
  let action = 'POST';
  let path = '/setpoints';
  let body = payload;
  let submit = false;

  if (payload.id) {
    path += `/${payload.id}`;
    submit = true;
    if (value && value !== '') {
      action = 'PUT';
    } else {
      action = 'DELETE';
      body = null;
    }
  } else if (value && value !== '') {
    submit = true;
  }

  if (submit) {
    const { url, options } = yield requestOptions(action, true, path, body);

    try {
      yield put(submitElement.request());
      const response = yield call(request, url, options);
      if (action === 'DELETE') {
        yield put(submitElement.success({ id: payload.id, action }));
      } else {
        yield put(submitElement.success({ setpoint: response, action }));
      }
    } catch (error) {
      yield handleReceiveAppError(error);
      yield put(submitElement.failure());
    } finally {
      yield put(submitElement.fulfill());
    }
  } else {
    yield put(submitElement.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChange(fetchAllEmploymentData.TRIGGER, fetchAllEmploymentDataSaga),
  cancelByLocationChange(initializeProfile.TRIGGER, initializeProfileSaga),
  cancelByLocationChange(fetchAllElementsData.TRIGGER, fetchAllElementsDataSaga),
  cancelByLocationChange(submitProfile.TRIGGER, submitProfileSaga),
  cancelByLocationChange(submitElement.TRIGGER, submitElementSaga),
  cancelByLocationChange(createEmployment.TRIGGER, createEmploymentSaga),
  cancelByLocationChange(editEmployment.TRIGGER, editEmploymentSaga),
  cancelByLocationChange(deleteEmployment.TRIGGER, deleteEmploymentSaga),
];
