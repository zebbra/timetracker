/* global describe it expect */
const moment = require("moment");
const valildators = require("../../common/validators");

describe("validators module", () => {
  it("validates day values", () => {
    expect(valildators.validateByUnit("d", "1")).to.be.ok();
    expect(valildators.validateByUnit("d", "0.5")).to.be.ok();
    expect(valildators.validateByUnit("d", "1.4")).to.not.be.ok();
  });

  it("validates hour values", () => {
    expect(valildators.validateByUnit("h", "1")).to.be.ok();
    expect(valildators.validateByUnit("h", "23.9")).to.be.ok();
    expect(valildators.validateByUnit("h", "0")).to.not.be.ok();
    expect(valildators.validateByUnit("h", "24")).to.not.be.ok();
    expect(valildators.validateByUnit("h", "24.1")).to.not.be.ok();
  });

  it("validates hour values", () => {
    expect(valildators.validateByUnit("r", "12:00-18:00")).to.be.ok();
    expect(valildators.validateByUnit("r", "0.4")).to.not.be.ok();
  });

  it("validates lession values", () => {
    expect(valildators.validateByUnit("l", "1")).to.be.ok();
    expect(valildators.validateByUnit("l", "23.9")).to.be.ok();
    expect(valildators.validateByUnit("l", "0")).to.not.be.ok();
    expect(valildators.validateByUnit("l", "24")).to.not.be.ok();
    expect(valildators.validateByUnit("l", "24.1")).to.not.be.ok();
  });

  it("validates week values", () => {
    expect(valildators.validateByUnit("w", "0")).to.be.ok();
    expect(valildators.validateByUnit("w", "1")).to.be.ok();
    expect(valildators.validateByUnit("w", "01")).to.be.ok();
    expect(valildators.validateByUnit("w", "01.0")).to.be.ok();
    expect(valildators.validateByUnit("w", "24.a")).to.not.be.ok();
  });

  it("validates text values", () => {
    expect(valildators.validateByUnit("t", "Text input")).to.be.ok();
    expect(
      valildators.validateByUnit(
        "t",
        "Very long text input (more than 255 chars) Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum."
      )
    ).to.not.be.ok();
  });

  it("validates isClosedDate", () => {
    expect(valildators.isClosedDate(moment().subtract(2, "years"))).to.be.ok();
    expect(valildators.isClosedDate(moment())).to.not.be.ok();
  });
});
