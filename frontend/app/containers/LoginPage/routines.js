import { createRoutine } from 'redux-saga-routines';

export const login = createRoutine('app/LoginPage/LOGIN');
export const verifyUser = createRoutine('app/LoginPage/VERIFY_USER');
export const requestPasswordReset = createRoutine('app/LoginPage/REQUEST_PASSWORD_RESET');
export const passwordReset = createRoutine('app/LoginPage/PASSWORD_RESET');
