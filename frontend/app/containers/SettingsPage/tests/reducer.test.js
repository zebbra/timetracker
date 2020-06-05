import reducer from '../reducer';

describe('settingsPageReducer', () => {
  it('returns the initial state', () => {
    const appReducerResult = reducer(undefined, {});
    expect(appReducerResult).toMatchSnapshot();
  });
});
