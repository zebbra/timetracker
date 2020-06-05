import { createRoutine } from 'redux-saga-routines';

export const fetchAllData = createRoutine('app/Calendar/FETCH_ALL_DATA');
export const editUserSettings = createRoutine('app/Calendar/EDIT_USER_SETTINGS');
export const deleteUserSettings = createRoutine('app/Calendar/DELETE_USER_SETTINGS');
