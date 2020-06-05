/**
 * Create the store with asynchronously loaded reducers
 */

import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { routerMiddleware } from 'react-router-redux';
import createSentryMiddleware from 'redux-sentry';
import Raven from 'raven-js';
import createSagaMiddleware from 'redux-saga';
import { loadingBarMiddleware } from 'react-redux-loading-bar';
import { routinesWatcherSaga } from 'redux-saga-routines';
import throttle from 'lodash/throttle';
import { watchDeleteSession, watchImpersonate, watchFetchVersion } from 'hocs/Session/sagas';

import createReducer from './reducers';
import { loadState, saveState } from './local-storage';

const sagaMiddleware = createSagaMiddleware({
  onError: (err) => { Raven.captureException(err); },
});

export default function configureStore(initialState = {}, history) {
  // Create the store with three middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. loadingBar: listens to saga actions and displays loading bar for TRIGGER and FULFILL events
  // 3. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    sagaMiddleware,
    loadingBarMiddleware({
      promiseTypeSuffixes: ['TRIGGER', 'FULFILL'],
    }),
    routerMiddleware(history),
  ];

  // install sentry if defiend
  if (process.env.SENTRY_PUBLIC_DSN) {
    const sentryMiddleware = createSentryMiddleware({
      dsn: process.env.SENTRY_PUBLIC_DSN,
      configuration: {
        environment: process.env.NODE_ENV,
      },
    });
    middlewares.unshift(sentryMiddleware);
  }

  const enhancers = [
    applyMiddleware(...middlewares),
  ];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
  /* eslint-enable */

  let store;
  const persistanState = loadState();
  if (persistanState) {
    store = createStore(
      createReducer(),
      fromJS(persistanState),
      composeEnhancers(...enhancers)
    );
  } else {
    store = createStore(
      createReducer(),
      fromJS(initialState),
      composeEnhancers(...enhancers)
    );
  }

  // Save App State in LocalStorage
  store.subscribe(throttle(() => {
    if (store.getState().getIn(['session', 'rememberMe'])) {
      saveState({
        app: store.getState().get('app'),
        session: store.getState().get('session'),
      });
    }
  }, 1000));

  // Extensions
  store.runSaga = sagaMiddleware.run;
  sagaMiddleware.run(routinesWatcherSaga);
  sagaMiddleware.run(watchDeleteSession);
  sagaMiddleware.run(watchImpersonate);
  sagaMiddleware.run(watchFetchVersion);
  store.asyncReducers = {}; // Async reducer registry
  store.asyncSagas = new Map(); // Async saga registry to avoid multiple executions of the same saga

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      import('./reducers').then((reducerModule) => {
        const createReducers = reducerModule.default;
        const nextReducers = createReducers(store.asyncReducers);

        store.replaceReducer(nextReducers);
      });
    });
  }

  return store;
}
