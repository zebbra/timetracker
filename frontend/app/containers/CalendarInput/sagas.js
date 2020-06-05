import { all, call, put, select, takeEvery } from 'redux-saga/effects';
import request from 'utils/request';
import moment from 'moment';

import { fetchReporting } from 'containers/TimePage/routines';
import { showAppError } from 'containers/App/actions';
import { navigate } from 'containers/Calendar/actions';
import { makeSelectNavigation } from 'containers/Calendar/selectors';
import { requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { timeToDecimal } from 'utils/generic-helpers';

import { SKIP_PARSE_UNITS } from './constants';
import { submitCalendarForm } from './routines';
import { makeSelectInitialValue } from './selectors';


// Individual exports for testing

/**
 * Saga to handle the create, edit, and delete actions in the calendar input cell
 *
 * @param {immutable map}   payload     The payload to store in the backend
 */
export function* submitCalendarFormSaga({ payload }) {
  const initialValue = yield select(makeSelectInitialValue());
  const parsedPayload = payload.toJS();
  const unit = parsedPayload.unit;
  const value = parsedPayload.value;

  delete parsedPayload.unit;
  let body = parsedPayload;
  let action = 'POST';
  let path = '/tracks';
  let submit = false;

  if (parsedPayload.id) {
    path += `/${parsedPayload.id}`;
    if (value) {
      action = 'PUT';
      submit = true;
    } else {
      action = 'DELETE';
      body = null;
      submit = true;
    }
  } else if (value) {
    submit = true;
  }

  const navigation = yield select(makeSelectNavigation());
  if (navigation) {
    yield put(navigate({ fromStore: true }));
  }

  if (submit && initialValue !== value) {
    if ((unit === 'h' || unit === 'n') && value.indexOf(':') !== -1) {
      body.value = timeToDecimal(value).toFixed(3);
    } else if (action !== 'DELETE' && SKIP_PARSE_UNITS.indexOf(unit) === -1 && (value.indexOf(',') !== -1 || value.indexOf('.') !== -1)) {
      body.value = Number(value.replace(',', '.')).toFixed(3);
    }

    const { url, options } = yield requestOptions(action, true, path, body);

    const date = moment(payload.get('date'));
    const reportingQuery = JSON.stringify({ where: {
      start: date,
      end: date,
      flat: true,
      type: 'timeseries',
      asMap: true,
    } });
    const reportingOptions = yield requestOptions('GET', true, `/elements/reporting?filter=${reportingQuery}`);

    try {
      yield put(submitCalendarForm.request());
      const response = yield call(request, url, options);
      const reporting = yield call(request, reportingOptions.url, reportingOptions.options);

      if (action === 'DELETE') {
        yield all([
          put(fetchReporting.trigger({ start: date.clone().startOf('year'), end: date.clone().endOf('year') })),
          put(submitCalendarForm.success({ id: parsedPayload.id, reporting, action })),
        ]);
      } else {
        yield all([
          put(fetchReporting.trigger({ start: date.clone().startOf('year'), end: date.clone().endOf('year') })),
          put(submitCalendarForm.success({ tracks: [response], reporting, action })),
        ]);
      }
    } catch (error) {
      const err = yield handleReceiveAppError(error, true, true);
      if (err.statusCode === 401) {
        yield put(showAppError(Object.assign(err, { status: 422 })));
      } else {
        yield put(showAppError(err));
      }
      yield put(submitCalendarForm.failure());
    }
  }

  yield put(submitCalendarForm.fulfill());
}

export function* submitCalendarFormSagaWatcher() {
  yield takeEvery(submitCalendarForm.TRIGGER, submitCalendarFormSaga);
}

// All sagas to be loaded
export default [
  submitCalendarFormSagaWatcher,
];
