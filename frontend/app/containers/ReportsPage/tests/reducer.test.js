import reducer from '../reducer';

describe('reportsPageReducer', () => {
  it('returns the initial state', () => {
    const appReducerResult = reducer(undefined, {});
    expect(appReducerResult).toMatchSnapshot();
  });
});
