import { all, call, put } from 'redux-saga/effects';
import request from 'utils/request';
import moment from 'moment';
import { sortBy } from 'lodash';

import { cancelByLocationChangeWithThrottle, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';

import { fetchReporting } from './routines';


// Individual exports for testing

/**
 * Saga to fetch static reporting for the give time-range the backend
 */
export function* fetchReportingSaga({ payload }) {
  const { start, end } = payload;
  const startOfYear = moment().year(moment(start).year()).startOf('year');
  const endOfYear = startOfYear.clone().endOf('year');

  const indicatorsQuery = JSON.stringify({ where: {
    start,
    end,
    flat: true,
    type: 'indicator',
  } });

  const timeseriesQuery = JSON.stringify({ where: {
    start: startOfYear,
    end: endOfYear,
    flat: false,
    type: 'timeseries',
  } });

  const indicatorsSettings = yield requestOptions('GET', true, `/elements/reporting?filter=${indicatorsQuery}`);
  const timeseriesSettings = yield requestOptions('GET', true, `/elements/reporting?filter=${timeseriesQuery}`);

  try {
    yield put(fetchReporting.request());
    const [reportings, timeseries] = yield all([
      call(request, indicatorsSettings.url, indicatorsSettings.options),
      call(request, timeseriesSettings.url, timeseriesSettings.options),
    ]);

    const indicators = sortBy(reportings, 'label');
    indicators.push({
      label: 'Saldo',
      saldo: timeseries.total.currentSaldo,
      unit: 'h',
    });

    yield put(fetchReporting.success(indicators));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchReporting.failure());
  } finally {
    yield put(fetchReporting.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChangeWithThrottle(fetchReporting.TRIGGER, fetchReportingSaga, 2),
];
