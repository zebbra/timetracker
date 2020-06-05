import { take, put, call, fork, cancel, takeLatest, throttle, select } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { browserHistory } from 'react-router';
import { head, tail } from 'lodash';

import { showAppError } from 'containers/App/actions';
import { makeSelectApi } from 'containers/App/selectors';
import { makeSelectToken } from 'hocs/Session/selectors';

/**
 * Generic request options generator
 *
 * @param {string}      method    HTTP method type
 * @param {boolean}     withAuth  whether to make an authenticated request (includes the token in the header)
 * @param {string}      uri       endpoint uri
 * @param {object|null} body      body to send (will be stringifed)
 * @param {object|null} params    params to send for GET request (will be stringifed)
 * @param {boolean}     fromOriginSession if withAuth and fromOriginSession are set to true we take the token which is stored under _originSession.token
 */
export function* requestOptions(method, withAuth, uri, body, params, fromOriginSession = false) {
  const { url } = yield select(makeSelectApi());
  const options = { method };
  let requestUrl = `${url}/api${uri}`;

  if (method === 'GET' && params) {
    const paramKeys = Object.keys(params);
    requestUrl += `?${head(paramKeys)}=${params[head(paramKeys)]}`;
    tail(paramKeys).forEach((key) => {
      requestUrl += `&${key}=${params[key]}`;
    });
  }

  // add the application/json header
  if (!options.headers) Object.assign(options, { headers: {} });
  Object.assign(options.headers, { 'Content-Type': 'application/json' });

  // add the authorization header if the request is authenticated
  if (withAuth) {
    const token = yield select(makeSelectToken(fromOriginSession));
    Object.assign(options.headers, {
      Authorization: token,
    });
  }

  // stringify body if one is present
  if (body) {
    options.body = JSON.stringify(body);
  }

  return { url: requestUrl, options };
}

/**
 * Parse the response error and redirect to unauthorized if code is 401
 *
 * @param {error}   error               the error object to handle
 * @param {boolean} customHandler       if true we return the dispatched error
 * @param {boolean} skipUnauthorized    if true we do not handle 401
 */
export function* handleReceiveAppError(error, customHandler, skipUnauthorized) {
  let response = {};
  if (error.response && error.response.json) {
    response = yield error.response.json();
  }
  Object.assign(error, response.error);

  // render global app error with server no available message if server is not available
  if (error.message && error.message === 'Failed to fetch') {
    Object.assign(error, { status: 520, message: 'Server nicht erreichbar', response: {} });
    yield put(showAppError(error));
  }

  // redirect to unauthorized page if the response code is 401
  if (!skipUnauthorized && response.error && response.error.statusCode && response.error.statusCode === 401) {
    // TODO handle 401 differently for token expired etc
    yield call(browserHistory.push, '/unauthorized');
    return null;
  } else if (customHandler) {
    return error;
  }
  yield put(showAppError(error));
  return null;
}

/**
 * Issue a backend ajax request which will be canceled upon location change
 *
 * @param {string}    watchingConstant    The action constant to watch
 * @param {function}  func                The saga to be executed when the event occures
 */
export function cancelByLocationChange(watchingConstant, func) {
  return function* cancelByLocationChangeGenerator() {
    const watcherFork = yield fork(takeLatest, watchingConstant, func);
    yield take(LOCATION_CHANGE);
    yield cancel(watcherFork);
  };
}

/**
 *Issue a throttled backend ajax request which will be canceled upon location change
 *
 * @param {string}    watchingConstant    The action constant to watch
 * @param {function}  func                The saga to be executed when the event occures
 * @param {number}    sec                 The throttling threshold
 */
export function cancelByLocationChangeWithThrottle(watchingConstant, func, sec) {
  return function* cancelByLocationChangeGenerator() {
    const watcherFork = yield fork(throttle, sec, watchingConstant, func);
    yield take(LOCATION_CHANGE);
    yield cancel(watcherFork);
  };
}
