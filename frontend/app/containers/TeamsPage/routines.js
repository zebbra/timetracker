import { createRoutine } from 'redux-saga-routines';

export const fetchTeams = createRoutine('app/TeamsPage/FETCH_TEAMS');
export const createTeam = createRoutine('app/TeamsPage/CREATE_TEAM');
export const editTeam = createRoutine('app/TeamsPage/EDIT_TEAM');
export const deleteTeam = createRoutine('app/TeamsPage/DELETE_TEAM');
