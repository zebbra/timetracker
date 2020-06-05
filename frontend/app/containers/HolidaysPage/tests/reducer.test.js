import reducer from '../reducer';

describe('holidaysPageRedcuer', () => {
  it('returns the initial state', () => {
    const appReducerResult = reducer(undefined, {});
    expect(appReducerResult).toMatchSnapshot();
  });
});
