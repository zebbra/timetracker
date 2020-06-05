import { createSelector } from 'reselect';

/**
 * Direct selector to the reportsPage state domain
 */
const selectReportsPageDomain = (state) => state.get('reportsPage');

/**
 * Other specific selectors
 */
const makeSelectSelectedYear = () => createSelector(
  selectReportsPageDomain,
  (substate) => substate.get('selectedYear'),
);

const makeSelectTimeseries = () => createSelector(
  selectReportsPageDomain,
  (substate) => substate.get('timeseries').map((data) => [data.get(0), data.get(7)]).toJS(),
);

/**
 * Default selector used by ReportsPage
 */
const makeSelectReportsPage = () => createSelector(
  selectReportsPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectReportsPage;
export {
  selectReportsPageDomain,
  makeSelectSelectedYear,
  makeSelectTimeseries,
};
