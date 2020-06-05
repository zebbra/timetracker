import { createSelector } from 'reselect';

/**
 * Direct selector to the elementsPage state domain
 */
const selectElementsPageDomain = (state) => state.get('elementsPage');

/**
 * Other specific selectors
 */
const makeSelectElements = () => createSelector(
  selectElementsPageDomain,
  (substate) => substate.get('elements').toJS(),
);

const makeSelectElement = () => createSelector(
  selectElementsPageDomain,
  (substate) => substate.get('element').toJS(),
);

const makeSelectRenderComponent = () => createSelector(
  selectElementsPageDomain,
  (substate) => substate.get('renderComponent'),
);

const makeSelectLoading = () => createSelector(
  selectElementsPageDomain,
  (substate) => substate.get('loading'),
);

/**
 * Default selector used by ElementsPage
 */
const makeSelectElementsPage = () => createSelector(
  selectElementsPageDomain,
  (substate) => substate.toJS()
);

export default makeSelectElementsPage;
export {
  selectElementsPageDomain,
  makeSelectElements,
  makeSelectElement,
  makeSelectRenderComponent,
  makeSelectLoading,
};
