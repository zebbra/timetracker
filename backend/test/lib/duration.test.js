/* global describe it expect */
const duration = require("../../common/duration");
const SECONDS_PER_WEEK = 60 * 60 * 8.4 * 5;
const SECONDS_PER_DAY = 60 * 60 * 8.4;

describe("duration module", () => {
  it("calculates day values as seconds", () => {
    expect(duration.durationByUnit("d", 1)).to.be(1 * SECONDS_PER_DAY);
  });

  it("discardes invalid day values and returns 0 seconds", () => {
    expect(duration.durationByUnit("d", "invalid")).to.be(0);
  });

  it("calculates hour values as seconds", () => {
    expect(duration.durationByUnit("h", 12)).to.be(60 * 60 * 12);
  });

  it("discardes invalid hour values and returns 0 seconds", () => {
    expect(duration.durationByUnit("h", "invalid")).to.be(0);
  });

  it("calculates range values as seconds", () => {
    expect(duration.durationByUnit("r", "08:00-12:00")).to.be(60 * 60 * 4);
  });

  it("discardes invalid range values and returns 0 seconds", () => {
    expect(duration.durationByUnit("r", "invalid")).to.be(0);
  });

  it("calculates lession values as seconds", () => {
    expect(duration.durationByUnit("l", "3")).to.be(
      Math.round(60 * 60 * 3 * 1 * 100) / 100
    );
  });

  it("discardes invalid lession values and returns 0 seconds", () => {
    expect(duration.durationByUnit("l", "invalid")).to.be(0);
  });

  it("calculates week values as seconds", () => {
    expect(duration.durationByUnit("w", "3")).to.be(3 * SECONDS_PER_WEEK);
  });

  it("discardes invalid week values and returns 0 seconds", () => {
    expect(duration.durationByUnit("w", "invalid")).to.be(0);
  });
});
