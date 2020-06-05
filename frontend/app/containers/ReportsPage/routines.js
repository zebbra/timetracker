import { createRoutine } from 'redux-saga-routines';

export const fetchAllTimeData = createRoutine('app/ReportsPage/FETCH_ALL_TIME_DATA');
export const fetchAllElementsData = createRoutine('app/ReportsPage/FETCH_ALL_ELEMENTS_DATA');
export const submitManualCorrection = createRoutine('app/ReportsPage/SUBMIT_MANUAL_CORRECTION');
export const submitExport = createRoutine('app/ReportsPage/SUBMIT_EXPORT');
