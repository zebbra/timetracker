import { createRoutine } from 'redux-saga-routines';

export const createEmployment = createRoutine('app/SettingsPage/CREATE_EMPLOYMENT');
export const editEmployment = createRoutine('app/SettingsPage/EDIT_EMPLOYMENT');
export const deleteEmployment = createRoutine('app/SettingsPage/DELETE_EMPLOYMENT');
export const fetchAllEmploymentData = createRoutine('app/SettingsPage/FETCH_ALL_EMPLOYMENT_DATA');
export const initializeProfile = createRoutine('app/SettingsPage/INITIALIZE_PROFILE');
export const submitProfile = createRoutine('app/SettingsPage/SUBMIT_PROFILE');
export const fetchAllElementsData = createRoutine('app/SettingsPage/FETCH_ALL_ELEMENTS_DATA');
export const submitElement = createRoutine('app/SettingsPage/SUBMIT_ELEMENT');
