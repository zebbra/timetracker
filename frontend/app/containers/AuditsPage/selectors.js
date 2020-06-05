import { createSelector } from 'reselect';

const selectAuditsPageDomain = (state) => state.get('auditsPage');

const makeSelectSelectedYear = () => createSelector(
  selectAuditsPageDomain,
  (substate) => substate.get('selectedYear'),
);

const makeSelectAudits = () => createSelector(
  selectAuditsPageDomain,
  (substate) => substate.get('audits').toJS(),
);

const makeSelectAudit = () => createSelector(
  selectAuditsPageDomain,
  (substate) => substate.get('audit').toJS(),
);

const makeSelectAuditsPage = () => createSelector(
  selectAuditsPageDomain, (substate) => substate
);

export default makeSelectAuditsPage;
export {
  selectAuditsPageDomain,
  makeSelectSelectedYear,
  makeSelectAudits,
  makeSelectAudit,
};
