import { createRoutine } from 'redux-saga-routines';

export const fetchUsers = createRoutine('app/UsersPage/FETCH_USERS');
export const editUser = createRoutine('app/UsersPage/EDIT_USER');
