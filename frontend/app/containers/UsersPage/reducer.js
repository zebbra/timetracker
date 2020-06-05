import { fromJS } from 'immutable';
import { unionBy } from 'lodash';

import { SET_RENDER_COMPONENT } from './constants';
import { fetchUsers, editUser } from './routines';

const initialState = fromJS({
  loading: false,
  renderComponent: 'table',
  users: [],
  user: {},
});

function usersPageReducer(state = initialState, action) {
  switch (action.type) {
    case fetchUsers.TRIGGER:
      return state
        .set('loading', true);
    case fetchUsers.FULFILL:
      return state
        .set('loading', false);
    case fetchUsers.SUCCESS:
      return state
        .set('users', fromJS(action.payload));

    case editUser.SUCCESS:
      return state
        .update('users', (data) => fromJS(unionBy([action.payload], data.toJS(), 'id')));

    case SET_RENDER_COMPONENT:
      return state
        .set('renderComponent', action.component)
        .set('user', fromJS(action.user));

    default:
      return state;
  }
}

export default usersPageReducer;
