import reducer from '../reducer';

describe('elementsPageReducer', () => {
  it('returns the initial state', () => {
    const appReducerResult = reducer(undefined, {});
    expect(appReducerResult).toMatchSnapshot();
  });
});
