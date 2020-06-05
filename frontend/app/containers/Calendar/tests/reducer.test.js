import MockDate from 'mockdate';
import moment from 'moment';
import reducer from '../reducer';

describe('calendarReducer', () => {
  it('returns the initial state', () => {
    MockDate.set(moment('2010-06-09T15:20:00-07:00'));
    const appReducerResult = reducer(undefined, {});
    MockDate.reset();
    expect(appReducerResult).toMatchSnapshot();
  });
});
