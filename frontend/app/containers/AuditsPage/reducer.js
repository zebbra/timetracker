import { fromJS } from 'immutable';
import moment from 'moment-timezone';

import { SET_SELECTED_YEAR, SET_RENDER_COMPONENT } from './constants';
import {
  fetchAuditLogs,
} from './routines';

const initialState = fromJS({
  selectedYear: moment().isoWeekYear(),
  loading: false,
  audits: [],
  audit: fromJS({}),
  renderComponent: 'table',
});

/* eslint-disable no-param-reassign */
const sanitizeAudits = (audits) => audits.map((audit) => {
  try {
    audit.username = audit.user && audit.user.username;
    if (audit.arguments) {
      audit.params = audit.arguments.params;
      audit.query = audit.arguments.query;
      audit.headers = audit.arguments.headers;

      if (audit.arguments.args) {
        audit.data = audit.arguments.args.data;
      }

      delete audit.arguments;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  return audit;
});

function auditsPageReducer(state = initialState, action) {
  switch (action.type) {
    case SET_SELECTED_YEAR:
      return state
        .set('selectedYear', action.year);

    case SET_RENDER_COMPONENT:
      return state
        .set('renderComponent', action.component)
        .set('audit', fromJS(action.audit));

    case fetchAuditLogs.TRIGGER:
      return state
        .set('loading', true);
    case fetchAuditLogs.FULFILL:
      return state
        .set('loading', false);
    case fetchAuditLogs.SUCCESS:
      return state
        .set('audits', fromJS(sanitizeAudits(action.payload)));

    default:
      return state;
  }
}

export default auditsPageReducer;
