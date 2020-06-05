import { createSelector } from 'reselect';


/**
 * Direct selectors to the different state domains
 */
const selectApp = (state) => state.get('app');
const selectRoutingDomain = (state) => state.get('route');

/**
 * Other specific selectors
 */
const makeSelectApi = () => createSelector(
  selectApp,
  (substate) => substate.get('api').toJS()
);

const makeSelectShowSidebarLeft = () => createSelector(
  selectApp,
  (substate) => substate.getIn(['sidebarLeft', 'show'])
);

const makeSelectSidebarRight = () => createSelector(
  selectApp,
  (substate) => substate.get('sidebarRight').toJS(),
);

const makeSelectAppError = () => createSelector(
  selectApp,
  (substate) => substate.get('error'),
);

const makeSelectAppInfo = () => createSelector(
  selectApp,
  (substate) => substate.get('info').toJS(),
);

const makeSelectCurrentPath = () => createSelector(
  selectRoutingDomain,
  (substate) => substate.getIn(['locationBeforeTransitions', 'pathname'])
);

const makeSelectOnboarded = () => createSelector(
  selectApp,
  (substate) => substate.get('onboarded'),
);

const makeSelectPrinting = () => createSelector(
  selectApp,
  (substate) => substate.get('printing'),
);

const makeSelectCurrentVersion = () => createSelector(
  selectApp,
  (substate) => substate.get('version')
);

const makeSelectLatestVersion = () => createSelector(
  selectApp,
  (substate) => substate.get('latestVersion')
);

// makeSelectLocationState expects a plain JS object for the routing state
const makeSelectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route'); // or state.route

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

export {
  selectApp,
  selectRoutingDomain,
  makeSelectApi,
  makeSelectShowSidebarLeft,
  makeSelectSidebarRight,
  makeSelectAppError,
  makeSelectAppInfo,
  makeSelectCurrentPath,
  makeSelectOnboarded,
  makeSelectPrinting,
  makeSelectCurrentVersion,
  makeSelectLatestVersion,
  makeSelectLocationState,
};
