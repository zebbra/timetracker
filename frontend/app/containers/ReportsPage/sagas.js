import { all, call, put, select } from 'redux-saga/effects';
import request from 'utils/request';
import moment from 'moment';

import { showAppInfo } from 'containers/App/actions';
import { makeSelectFirstName, makeSelectLastName } from 'hocs/Session/selectors';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { exportToCsv } from 'utils/generic-helpers';

import { fetchAllTimeData, fetchAllElementsData, submitManualCorrection, submitExport } from './routines';
import { makeSelectSelectedYear } from './selectors';

// Individual exports for testing

/**
 * Saga to fetch all time data for the selected year
 */
export function* fetchAllTimeDataSaga() {
  const year = yield select(makeSelectSelectedYear());
  const startOfYear = moment().year(year).startOf('year');
  const endOfYear = startOfYear.clone().endOf('year');

  const staticReportingQuery = JSON.stringify({ where: {
    start: startOfYear,
    end: endOfYear,
    flat: true,
    type: 'indicator',
  } });

  const timeseriesQuery = JSON.stringify({ where: {
    start: startOfYear,
    end: endOfYear,
    flat: false,
    type: 'timeseries',
  } });

  const staticReportingSettings = yield requestOptions('GET', true, `/elements/reporting?filter=${staticReportingQuery}`);
  const timeseriesSettings = yield requestOptions('GET', true, `/elements/reporting?filter=${timeseriesQuery}`);

  try {
    yield put(fetchAllTimeData.request());
    const [indicators, timeseries] = yield all([
      call(request, staticReportingSettings.url, staticReportingSettings.options),
      call(request, timeseriesSettings.url, timeseriesSettings.options),
    ]);
    indicators.push({
      id: 'total-indicator-static',
      label: 'Total',
      unit: 'h',
      actual: timeseries.total.currentActual,
      target: timeseries.total.currentTarget,
      saldo: timeseries.total.currentSaldo,
    });
    yield put(fetchAllTimeData.success({ indicators, timeseries }));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchAllTimeData.failure());
  } finally {
    yield put(fetchAllTimeData.fulfill());
  }
}

/**
 * Saga to fetch all elements data for the selected year
 */
export function* fetchAllElementsDataSaga() {
  const year = yield select(makeSelectSelectedYear());
  const startOfYear = moment().year(year).startOf('year');
  const endOfYear = startOfYear.clone().endOf('year');

  const query = JSON.stringify({ where: {
    start: startOfYear,
    end: endOfYear,
    flat: true,
    type: 'generic',
  } });

  const { url, options } = yield requestOptions('GET', true, `/elements/reporting?filter=${query}`);

  try {
    yield put(fetchAllElementsData.request());
    const response = yield call(request, url, options);
    yield put(fetchAllElementsData.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchAllElementsData.failure());
  } finally {
    yield put(fetchAllElementsData.fulfill());
  }
}

/**
 * Saga to submit a manual correction for a specific profile and store it in the backend
 *
 * @param {object}   payload     The value to store in the backend
 */
export function* submitManualCorrectionSaga({ payload }) {
  const body = {};
  body[payload.name] = payload.value;
  const { url, options } = yield requestOptions('PUT', true, `/employment-profiles/${payload.id}`, body);

  try {
    yield put(submitManualCorrection.request());
    const response = yield call(request, url, options);
    yield put(submitManualCorrection.success(response));
  } catch (error) {
    if (error) {
      yield handleReceiveAppError(error);
      yield put(submitManualCorrection.failure());
    }
  } finally {
    yield put(submitManualCorrection.fulfill());
  }
}

export function* submitExportSaga({ payload }) {
  const query = JSON.stringify({ where: {
    start: payload.get('start'),
    end: payload.get('end'),
    flat: payload.get('flat'),
    comments: payload.get('comments'),
    type: 'export',
  } });

  const { url, options } = yield requestOptions('GET', true, `/elements/reporting?filter=${query}`);

  try {
    yield put(submitExport.request());
    const response = yield call(request, url, options);
    const firstName = yield select(makeSelectFirstName());
    const lastName = yield select(makeSelectLastName());
    const start = moment(payload.get('start')).format('DD.MM.YYYY');
    const end = moment(payload.get('end')).format('DD.MM.YYYY');
    const filename = `CSV-Export ${firstName} ${lastName} ${start} - ${end}.csv`;
    exportToCsv(filename, response);
    yield put(showAppInfo({ message: 'CSV Export steht zum Download bereit' }));
    yield put(submitExport.success(response));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(submitExport.failure());
  } finally {
    yield put(submitExport.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChange(fetchAllTimeData.TRIGGER, fetchAllTimeDataSaga),
  cancelByLocationChange(fetchAllElementsData.TRIGGER, fetchAllElementsDataSaga),
  cancelByLocationChange(submitManualCorrection.TRIGGER, submitManualCorrectionSaga),
  cancelByLocationChange(submitExport.TRIGGER, submitExportSaga),
];
