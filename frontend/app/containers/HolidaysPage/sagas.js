import { call, put, select } from 'redux-saga/effects';
import request from 'utils/request';
import { SubmissionError } from 'redux-form/immutable';
import moment from 'moment-timezone';

import { showAppError, showAppInfo } from 'containers/App/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { validationErrors } from 'utils/generic-errors';

import { setRenderComponent } from './actions';
import { fetchHolidays, createHoliday, editHoliday, deleteHoliday } from './routines';
import { makeSelectSelectedYear } from './selectors';

import { data } from './dataFormat';
const fieldMapping = {};
data.forEach((field) => {
  fieldMapping[field.name] = field.label;
});


// Individual exports for testing

/**
 * Saga to fetch all holidays for the given year from the backend
 */
export function* fetchHolidaysSaga() {
  const selectedYear = yield select(makeSelectSelectedYear());
  const startOfYear = moment().isoWeekYear(selectedYear).startOf('year').startOf('day').toISOString();
  const endOfYear = moment().isoWeekYear(selectedYear).endOf('year').endOf('day').toISOString();
  const whereFilter = `filter[where][date][between][0]=${startOfYear}&filter[where][date][between][1]=${endOfYear}`;

  const { url, options } = yield requestOptions('GET', true, `/holidays?${whereFilter}`, null);

  try {
    yield put(fetchHolidays.request());
    const response = yield call(request, url, options);
    yield put(fetchHolidays.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchHolidays.failure());
  } finally {
    yield put(fetchHolidays.fulfill());
  }
}

/**
 * Saga to create a new holiday in the backend
 *
 * @param {immutable map}   payload     The holiday to create
 */
export function* createHolidaySaga({ payload }) {
  if (payload.get('date')) {
    payload.set('date', moment(payload.get('date')).startOf('day').toDate());
  }
  const { url, options } = yield requestOptions('POST', true, '/holidays', payload);

  try {
    yield put(createHoliday.request());
    const response = yield call(request, url, options);
    yield put(createHoliday.success(response));
    yield put(showAppInfo({ message: `Feiertag ${response.label} wurde erstellt` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(createHoliday.failure(new SubmissionError(validationErrors(err, 'Feiertag konnte nicht erstellt werden', fieldMapping))));
    } else {
      yield put(createHoliday.failure(new SubmissionError({ _error: 'Beim Erstellen des Feiertages ist ein unbekannter Fehler aufgetreten' })));
      yield put(showAppError(err));
    }
  } finally {
    yield put(createHoliday.fulfill());
  }
}

/**
 * Saga to update an element in the backend
 *
 * @param {immutable map}   payload     The holiday to update in the backend
 */
export function* editHolidaySaga({ payload }) {
  if (payload.get('date')) {
    payload.set('date', moment(payload.get('date')).startOf('day').toDate());
  }
  const { url, options } = yield requestOptions('PUT', true, `/holidays/${payload.get('id')}`, payload);

  try {
    yield put(editHoliday.request());
    const response = yield call(request, url, options);
    yield put(editHoliday.success(response));
    yield put(showAppInfo({ message: `Feiertag ${response.label} wurde geändert` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    const err = yield handleReceiveAppError(error, true);
    if (err.name === 'ValidationError') {
      yield put(editHoliday.failure(new SubmissionError(validationErrors(err, 'Feiertag konnte nicht geändert werden', fieldMapping))));
    } else {
      yield put(editHoliday.failure(new SubmissionError({ _error: 'Beim Ändern des Feiertages ist ein unbekannter Fehler aufgetreten' })));
      yield put(showAppError(err));
    }
  } finally {
    yield put(editHoliday.fulfill());
  }
}

/**
 * Saga to delete a holiday in the backend
 * @param {object}    payload     The holiday to delete
 */
export function* deleteHolidaySaga({ payload }) {
  const { url, options } = yield requestOptions('DELETE', true, `/holidays/${payload.id}`, null);

  try {
    yield put(deleteHoliday.request());
    yield call(request, url, options);
    yield put(deleteHoliday.success(payload));
    yield put(showAppInfo({ message: `Feiertag ${payload.label} wurde gelöscht` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    yield handleReceiveAppError(error);
  } finally {
    yield put(deleteHoliday.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChange(fetchHolidays.TRIGGER, fetchHolidaysSaga),
  cancelByLocationChange(createHoliday.TRIGGER, createHolidaySaga),
  cancelByLocationChange(editHoliday.TRIGGER, editHolidaySaga),
  cancelByLocationChange(deleteHoliday.TRIGGER, deleteHolidaySaga),
];
