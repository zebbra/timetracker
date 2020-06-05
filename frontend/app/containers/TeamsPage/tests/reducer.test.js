import reducer from '../reducer';

describe('teamsPageReducer', () => {
  it('returns the initial state', () => {
    const teamsReducerResult = reducer(undefined, {});
    expect(teamsReducerResult).toMatchSnapshot();
  });
});
