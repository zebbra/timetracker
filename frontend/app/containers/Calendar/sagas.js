import { call, put, select, all } from 'redux-saga/effects';
import request from 'utils/request';

import { fetchReporting } from 'containers/TimePage/routines';
import { cancelByLocationChangeWithThrottle, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';

import { fetchAllData, editUserSettings, deleteUserSettings } from './routines';
import { makeSelectSelectedDate } from './selectors';


// Individual exports for testing

/**
 * Saga to fetch all data required by the calendar at once. This includes tracks, holidays, elements,
 * and the user settings
 */
export function* fetchAllDataSaga() {
  const selectedDate = yield select(makeSelectSelectedDate());
  const startOfWeek = selectedDate.clone().startOf('isoweek').startOf('day').toDate();
  const startOfYear = selectedDate.clone().startOf('year').startOf('day').toDate();
  const endOfWeek = selectedDate.clone().endOf('isoweek').endOf('day').toDate();
  const endOfYear = selectedDate.clone().endOf('year').endOf('day').toDate();
  const endOfYearAndWeek = selectedDate.clone().endOf('year').endOf('week').endOf('day').toDate();

  const holidaysQuery = JSON.stringify({ where: {
    date: { between: [startOfYear, endOfYearAndWeek] },
  } });

  const elementsQuery = JSON.stringify({
    where: {
      and: [
        { start: { lte: endOfWeek } },
        { or: [{ end: null }, { end: { gte: startOfWeek } }] },
      ],
    },
  });

  const tracksQuery = JSON.stringify({ where: {
    and: [
      { date: { gte: startOfWeek } },
      { date: { lte: endOfWeek } },
    ] },
  });

  const settingsQuery = JSON.stringify({ where: {
    component: 'calendar',
  } });

  const reportingQuery = JSON.stringify({ where: {
    start: startOfWeek,
    end: endOfWeek,
    flat: true,
    type: 'timeseries',
    asMap: true,
  } });

  const holidaysSettings = yield requestOptions('GET', true, `/holidays?filter=${holidaysQuery}`);
  const elementsSettings = yield requestOptions('GET', true, `/elements?filter=${elementsQuery}`);
  const tracksSettings = yield requestOptions('GET', true, `/users/me/tracks?filter=${tracksQuery}`);
  const settingsSettings = yield requestOptions('GET', true, `/users/me/component-settings?filter=${settingsQuery}`);
  const reportingSettings = yield requestOptions('GET', true, `/elements/reporting?filter=${reportingQuery}`);

  try {
    yield put(fetchAllData.request());
    const [holidays, elements, tracks, settings, reporting] = yield all([
      call(request, holidaysSettings.url, holidaysSettings.options),
      call(request, elementsSettings.url, elementsSettings.options),
      call(request, tracksSettings.url, tracksSettings.options),
      call(request, settingsSettings.url, settingsSettings.options),
      call(request, reportingSettings.url, reportingSettings.options),
      put(fetchReporting.trigger({ start: startOfYear, end: endOfYear })),
    ]);
    yield put(fetchAllData.success({ holidays, elements, tracks, settings, reporting }));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchAllData.failure());
  } finally {
    yield put(fetchAllData.fulfill());
  }
}

/**
 * Saga to store the new user settings in the backend
 *
 * @param {immutable map}   payload     The user settings to store in the backend
 */
export function* editUserSettingsSaga({ payload }) {
  const method = payload.get('id') ? 'PUT' : 'POST';
  const path = payload.get('id') ? `/component-settings/${payload.get('id')}` : '/component-settings';

  const { url, options } = yield requestOptions(method, true, path, payload.set('component', 'calendar'));

  try {
    yield put(editUserSettings.request());
    const response = yield call(request, url, options);
    yield put(editUserSettings.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(editUserSettings.failure());
  } finally {
    yield put(editUserSettings.fulfill());
  }
}

export function* deleteUserSettingsSaga({ payload }) {
  const { url, options } = yield requestOptions('DELETE', true, `/component-settings/${payload.get('id')}`);

  try {
    yield put(deleteUserSettings.request());
    yield call(request, url, options);
    yield put(deleteUserSettings.success());
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(deleteUserSettings.failure());
  } finally {
    yield put(deleteUserSettings.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChangeWithThrottle(fetchAllData.TRIGGER, fetchAllDataSaga, 2),
  cancelByLocationChangeWithThrottle(editUserSettings.TRIGGER, editUserSettingsSaga, 2),
  cancelByLocationChangeWithThrottle(deleteUserSettings.TRIGGER, deleteUserSettingsSaga, 2),
];
