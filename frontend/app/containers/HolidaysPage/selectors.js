import { createSelector } from 'reselect';

/**
 * Direct selector to the holidaysPage state domain
 */
const selectHolidaysPageDomain = (state) => state.get('holidaysPage');

/**
 * Other specific selectors
 */
const makeSelectHolidays = () => createSelector(
  selectHolidaysPageDomain,
  (substate) => substate.get('holidays').toJS(),
);

const makeSelectHoliday = () => createSelector(
  selectHolidaysPageDomain,
  (substate) => substate.get('holiday').toJS(),
);

const makeSelectRenderComponent = () => createSelector(
  selectHolidaysPageDomain,
  (substate) => substate.get('renderComponent'),
);

const makeSelectSelectedYear = () => createSelector(
  selectHolidaysPageDomain,
  (substate) => substate.get('selectedYear'),
);

const makeSelectLoading = () => createSelector(
  selectHolidaysPageDomain,
  (substate) => substate.get('loading'),
);


/**
 * Default selector used by HolidaysPage
 */
const makeSelectHolidaysPage = () => createSelector(
  selectHolidaysPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectHolidaysPage;
export {
  selectHolidaysPageDomain,
  makeSelectHolidays,
  makeSelectHoliday,
  makeSelectSelectedYear,
  makeSelectRenderComponent,
  makeSelectLoading,
};
