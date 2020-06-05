import { createSelector } from 'reselect';
import { find } from 'lodash';

/**
 * Direct selector to the teamsPage state domain
 */
const selectTeamsPageDomain = (state) => state.get('teamsPage');

/**
 * Other specific selectors
 */
const makeSelectUsers = () => createSelector(
  selectTeamsPageDomain,
  (substate) => substate.get('users').filter((team) => !find(team.toJS().roles, { name: 'admin' })).toJS(),
);

const makeSelectAllTeams = () => createSelector(
  selectTeamsPageDomain,
  (substate) => substate.get('allTeams').toJS(),
);

const makeSelectTeam = () => createSelector(
  selectTeamsPageDomain,
  (substate) => substate.get('team').toJS(),
);

const makeSelectRenderComponent = () => createSelector(
  selectTeamsPageDomain,
  (substate) => substate.get('renderComponent'),
);

const makeSelectLoading = () => createSelector(
  selectTeamsPageDomain,
  (substate) => substate.get('loading'),
);


/**
 * Default selector used by TeamsPage
 */

const makeSelectTeamsPage = () => createSelector(
  selectTeamsPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectTeamsPage;
export {
  selectTeamsPageDomain,
  makeSelectUsers,
  makeSelectAllTeams,
  makeSelectTeam,
  makeSelectRenderComponent,
  makeSelectLoading,
};
