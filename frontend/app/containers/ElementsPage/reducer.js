/*
 *
 * ElementsPage reducer
 *
 */

import { fromJS } from 'immutable';
import { unionBy, filter } from 'lodash';

import { SET_RENDER_COMPONENT } from './constants';
import { fetchElements, createElement, editElement, deleteElement } from './routines';

const initialState = fromJS({
  elements: [],
  element: fromJS({}),
  renderComponent: 'table',
  loading: false,
});

/* eslint-disable no-param-reassign */
const sanitizeElements = (elements) => elements.map((element) => {
  element.start = new Date(element.start);
  if (element.end) {
    element.end = new Date(element.end);
  }
  if (element.minEnd) {
    element.minEnd = new Date(element.minEnd);
  }
  if (element.maxStart) {
    element.maxStart = new Date(element.maxStart);
  }
  return element;
});
/* eslint-enabel no-param-reassign */

function elementsPageReducer(state = initialState, action) {
  switch (action.type) {
    // Handle GET
    case fetchElements.TRIGGER:
      return state
        .set('loading', true);
    case fetchElements.FULFILL:
      return state
        .set('loading', false);
    case fetchElements.SUCCESS:
      return state
        .set('elements', fromJS(sanitizeElements(action.payload)));

    // Handle POST and PUT
    case createElement.SUCCESS:
    case editElement.SUCCESS:
      return state
        .update('elements', (data) => fromJS(unionBy(sanitizeElements([action.payload]), data.toJS(), 'id')));

    // Handle DELETE
    case deleteElement.SUCCESS:
      return state
        .update('elements', (data) => fromJS(filter(data.toJS(), (element) => element.id !== action.payload.id)));

    // Handle set render component
    case SET_RENDER_COMPONENT:
      return state
        .set('renderComponent', action.component)
        .set('element', fromJS(action.element));

    default:
      return state;
  }
}

export default elementsPageReducer;
