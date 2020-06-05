import reducer from '../reducer';

describe('timePageRedcuer', () => {
  it('returns the initial state', () => {
    const timePageRedcuer = reducer(undefined, {});
    expect(timePageRedcuer).toMatchSnapshot();
  });
});
