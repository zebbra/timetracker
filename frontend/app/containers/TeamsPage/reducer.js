/*
 *
 * TeamsPage reducer
 *
 */

import { fromJS } from 'immutable';
import { unionBy, filter } from 'lodash';

import { SET_RENDER_COMPONENT } from './constants';
import { fetchTeams, createTeam, editTeam, deleteTeam } from './routines';

const initialState = fromJS({
  allTeams: [],
  users: [],
  team: fromJS({}),
  renderComponent: 'table',
  loading: false,
});

function teamsPageReducer(state = initialState, action) {
  switch (action.type) {
    // Handle GET
    case fetchTeams.TRIGGER:
      return state
        .set('loading', true);
    case fetchTeams.FULFILL:
      return state
        .set('loading', false);
    case fetchTeams.SUCCESS:
      return state
        .set('allTeams', fromJS(action.payload.allTeams))
        .set('users', fromJS(action.payload.users));

    // Handle POST and PUT
    case createTeam.SUCCESS:
    case editTeam.SUCCESS:
      return state
        .update('allTeams', (data) => fromJS(unionBy([action.payload], data.toJS(), 'id')));

    // Handle DELETE
    case deleteTeam.SUCCESS:
      return state
        .update('allTeams', (data) => fromJS(filter(data.toJS(), (team) => team.id !== action.payload.id)));

    // Handle set render component
    case SET_RENDER_COMPONENT:
      return state
        .set('renderComponent', action.component)
        .set('team', fromJS(action.team));

    default:
      return state;
  }
}

export default teamsPageReducer;
