import { createRoutine } from 'redux-saga-routines';

export const fetchElements = createRoutine('app/ElementsPage/FETCH_ELEMENTS');
export const createElement = createRoutine('app/ElementsPage/CREATE_ELEMENT');
export const editElement = createRoutine('app/ElementsPage/EDIT_ELEMENT');
export const deleteElement = createRoutine('app/ElementsPage/DELETE_ELEMENT');
