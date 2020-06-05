import { all, call, put } from 'redux-saga/effects';
import request from 'utils/request';
import { SubmissionError } from 'redux-form/immutable';

import { showAppError, showAppInfo } from 'containers/App/actions';
import { cancelByLocationChange, requestOptions, handleReceiveAppError } from 'utils/generic-sagas';
import { validationErrors } from 'utils/generic-errors';

import { setRenderComponent } from './actions';
import { fetchTeams, createTeam, editTeam, deleteTeam } from './routines';

import { data } from './dataFormat';
const fieldMapping = {};
data.forEach((field) => {
  fieldMapping[field.name] = field.label;
});

// Individual exports for testing

/**
 * Saga to fetch all teams from the backend
 */
export function* fetchTeamsSaga() {
  const teamsSettings = yield requestOptions('GET', true, '/teams', null);
  const usersSettings = yield requestOptions('GET', true, '/users', null);

  try {
    yield put(fetchTeams.request());
    const [allTeams, users] = yield all([
      call(request, teamsSettings.url, teamsSettings.options),
      call(request, usersSettings.url, usersSettings.options),
    ]);
    yield put(fetchTeams.success({ allTeams, users }));
  } catch (error) {
    yield handleReceiveAppError(error);
    yield put(fetchTeams.failure());
  } finally {
    yield put(fetchTeams.fulfill());
  }
}

/**
 * Saga to create a new team and store it in the backend
 *
 * @param {immutable map}   payload     The team to store in the backend
 */
export function* createTeamSaga({ payload }) {
  const parsedPayload = payload.toJS();
  let clientErr;
  if (!parsedPayload.leaders || parsedPayload.leaders.length === 0) {
    clientErr = 'Teamleiter darf nicht leer sein';
  }
  if (!parsedPayload.members || parsedPayload.members.length === 0) {
    if (clientErr) {
      clientErr = 'Teamleiter und Teammitglieder dürfen nicht leer sein';
    } else {
      clientErr = 'Teammitglieder darf nicht leer sein';
    }
  }
  if (clientErr) {
    yield put(createTeam.failure(new SubmissionError({ _error: clientErr })));
    yield put(createTeam.fulfill());
  } else {
    const body = {
      name: parsedPayload.name,
      members: [],
    };
    parsedPayload.leaders.forEach((leader) => {
      body.members.push({ id: leader.value, isTeamleader: true });
    });
    parsedPayload.members.forEach((member) => {
      body.members.push({ id: member.value, isTeamleader: false });
    });

    const { url, options } = yield requestOptions('POST', true, '/teams/teamWithMembers', body);
    try {
      yield put(createTeam.request());
      const response = yield call(request, url, options);
      yield put(createTeam.success(response));
      yield put(showAppInfo({ message: `Team ${response.name} wurde erstellt` }));
      yield put(setRenderComponent('table', {}));
    } catch (error) {
      const err = yield handleReceiveAppError(error, true);
      if (err.name === 'ValidationError') {
        yield put(createTeam.failure(new SubmissionError(validationErrors(err, 'Team konnte nicht erstellt werden', fieldMapping))));
      } else {
        yield put(createTeam.failure(new SubmissionError({ _error: 'Beim Erstellen des Teams ist ein unbekannter Fehler aufgetreten' })));
        yield put(showAppError(err));
      }
    } finally {
      yield put(createTeam.fulfill());
    }
  }
}

/**
 * Saga to update a team in the backend
 *
 * @param {immutable map}   payload     The team payload to udpate in the backend
 */
export function* editTeamSaga({ payload }) {
  const parsedPayload = payload.toJS();
  let clientErr;
  if (!parsedPayload.leaders || parsedPayload.leaders.length === 0) {
    clientErr = 'Teamleiter darf nicht leer sein';
  }
  if (!parsedPayload.members || parsedPayload.members.length === 0) {
    if (clientErr) {
      clientErr = 'Teamleiter und Teammitglieder dürfen nicht leer sein';
    } else {
      clientErr = 'Teammitglieder darf nicht leer sein';
    }
  }
  if (clientErr) {
    yield put(editTeam.failure(new SubmissionError({ _error: clientErr })));
    yield put(editTeam.fulfill());
  } else {
    const body = {
      name: parsedPayload.name,
      members: [],
    };
    parsedPayload.leaders.forEach((leader) => {
      body.members.push({ id: leader.value, isTeamleader: true });
    });
    parsedPayload.members.forEach((member) => {
      body.members.push({ id: member.value, isTeamleader: false });
    });

    const { url, options } = yield requestOptions('PUT', true, `/teams/${payload.get('id')}/teamWithMembers`, body);
    try {
      yield put(editTeam.request());
      const response = yield call(request, url, options);
      yield put(editTeam.success(response));
      yield put(showAppInfo({ message: `Team ${response.name} wurde geändert` }));
      yield put(setRenderComponent('table', {}));
    } catch (error) {
      const err = yield handleReceiveAppError(error, true);
      if (err.name === 'ValidationError') {
        yield put(editTeam.failure(new SubmissionError(validationErrors(err, 'Team konnte nicht geändert werden', fieldMapping))));
      } else {
        yield put(editTeam.failure(new SubmissionError({ _error: 'Beim Ändern des Teams ist ein unbekannter Fehler aufgetreten' })));
        yield put(showAppError(err));
      }
    } finally {
      yield put(editTeam.fulfill());
    }
  }
}

/**
 * Delete a team in the backend
 *
 * @param {object}    payload     The team to delete
 */
export function* deleteTeamSaga({ payload }) {
  const { url, options } = yield requestOptions('DELETE', true, `/teams/${payload.id}`, null);

  try {
    yield put(deleteTeam.request());
    yield call(request, url, options);
    yield put(deleteTeam.success(payload));
    yield put(showAppInfo({ message: `Team ${payload.name} wurde gelöscht` }));
    yield put(setRenderComponent('table', {}));
  } catch (error) {
    yield handleReceiveAppError(error);
  } finally {
    yield put(deleteTeam.fulfill());
  }
}

// All sagas to be loaded
export default [
  cancelByLocationChange(fetchTeams.TRIGGER, fetchTeamsSaga),
  cancelByLocationChange(createTeam.TRIGGER, createTeamSaga),
  cancelByLocationChange(editTeam.TRIGGER, editTeamSaga),
  cancelByLocationChange(deleteTeam.TRIGGER, deleteTeamSaga),
];
