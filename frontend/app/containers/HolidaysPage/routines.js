import { createRoutine } from 'redux-saga-routines';

export const fetchHolidays = createRoutine('app/HolidaysPage/FETCH_HOLIDAYS');
export const createHoliday = createRoutine('app/HolidaysPage/CREATE_HOLIDAY');
export const editHoliday = createRoutine('app/HolidaysPage/EDIT_HOLIDAY');
export const deleteHoliday = createRoutine('app/HolidaysPage/DELETE_HOLIDAY');
