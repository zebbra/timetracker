/*
 *
 * ProfilePage reducer
 *
 */

import { fromJS } from 'immutable';

import { fetchProfile, editProfile } from './routines';

const initialState = fromJS({
  username: undefined,
  email: undefined,
  firstName: undefined,
  lastName: undefined,
  roles: undefined,
});

function profilePageReducer(state = initialState, action) {
  switch (action.type) {

    // Handle GET profile
    case fetchProfile.SUCCESS:
      return fromJS(action.payload);

    case fetchProfile.FAILURE:
      return initialState;

    // Handle PUT profile
    case editProfile.SUCCESS:
      return state
        .set('firstName', action.payload.firstName)
        .set('lastName', action.payload.lastName);

    default:
      return state;
  }
}

export default profilePageReducer;
