import reducer from '../reducer';

describe('appReducer', () => {
  it('returns the initial state', () => {
    const appReducerResult = reducer(undefined, {});
    expect(appReducerResult).toMatchSnapshot();
  });
});
