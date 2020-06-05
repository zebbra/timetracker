import { createSelector } from 'reselect';

const selectUsersPageDomain = (state) => state.get('usersPage');

const makeSelectLoading = () => createSelector(
  selectUsersPageDomain,
  (substate) => substate.get('loading'),
);

const makeSelectRenderComponent = () => createSelector(
  selectUsersPageDomain,
  (substate) => substate.get('renderComponent'),
);

const makeSelectUsers = () => createSelector(
  selectUsersPageDomain,
  (substate) => substate.get('users').toJS(),
);

const makeSelectUser = () => createSelector(
  selectUsersPageDomain,
  (substate) => substate.get('user').toJS(),
);

const makeSelectUsersPage = () => createSelector(
  selectUsersPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectUsersPage;
export {
  selectUsersPageDomain,
  makeSelectLoading,
  makeSelectRenderComponent,
  makeSelectUsers,
  makeSelectUser,
};
