import { createRoutine } from 'redux-saga-routines';

export const fetchProfile = createRoutine('app/ProfilePage/FETCH_PROFILE');
export const editProfile = createRoutine('app/ProfilePage/EDIT_PROFILE');
export const editPassword = createRoutine('app/ProfilePage/EDIT_PASSWORD');
export const deleteUser = createRoutine('app/ProfilePage/DELETE_USER');
