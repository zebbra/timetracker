import reducer from '../reducer';

describe('profilePageReducer', () => {
  it('returns the initial state', () => {
    const profilePageReducer = reducer(undefined, {});
    expect(profilePageReducer).toMatchSnapshot();
  });
});
