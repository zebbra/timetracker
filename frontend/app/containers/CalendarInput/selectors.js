import { createSelector } from 'reselect';

/**
 * Direct selector to the calendarInput state domain
 */
const selectCalendarInputDomain = (state) => state.get('calendarInput');

/**
 * Other specific selectors
 */
const makeSelectInitialValue = () => createSelector(
  selectCalendarInputDomain,
  (substate) => substate.get('initialValue'),
);

/**
 * Default selector used by CalendarInput
 */
const makeSelectCalendarInput = () => createSelector(
  selectCalendarInputDomain,
  (substate) => substate.toJS()
);

export default makeSelectCalendarInput;
export {
  selectCalendarInputDomain,
  makeSelectInitialValue,
};
