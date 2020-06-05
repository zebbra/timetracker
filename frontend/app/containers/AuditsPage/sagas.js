import { call, put, select } from 'redux-saga/effects';
import request from 'utils/request';
import moment from 'moment';

import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';

import {
  fetchAuditLogs,
} from './routines';
import { makeSelectSelectedYear } from './selectors';

export function* fetchAuditLogsSage({ payload: username }) {
  const selectedYear = yield select(makeSelectSelectedYear());
  const startOfYear = moment().isoWeekYear(selectedYear).startOf('year').startOf('day').toISOString();
  const endOfYear = moment().isoWeekYear(selectedYear).endOf('year').endOf('day').toISOString();

  const query = JSON.stringify({
    where: {
      createdAt: {
        between: [startOfYear, endOfYear],
      },
      'user.username': username,
    },
    order: 'createdAt DESC',
  });

  const auditsSettings = yield requestOptions('GET', true, `/changelogs?filter=${query}`, null, null, true);

  try {
    yield put(fetchAuditLogs.request());
    const audits = yield call(request, auditsSettings.url, auditsSettings.options);
    yield put(fetchAuditLogs.success(audits));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchAuditLogs.failure());
  } finally {
    yield put(fetchAuditLogs.fulfill());
  }
}

export default [
  cancelByLocationChange(fetchAuditLogs.TRIGGER, fetchAuditLogsSage),
];
