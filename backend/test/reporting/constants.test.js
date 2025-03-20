/* global describe it */
const expect = require("expect.js");
const constants = require("../../common/reporting/constants");

describe("Reporting Constants", () => {
  it("should export HOURS_PER_DAY constant", () => {
    expect(constants.HOURS_PER_DAY).to.be(8.4);
  });

  it("should export DATE_KEY_FORMAT constant", () => {
    expect(constants.DATE_KEY_FORMAT).to.equal("YYYYMMDD");
  });

  it("should export LABEL_TO_PROFILE_LOOKUP mapping", () => {
    expect(constants.LABEL_TO_PROFILE_LOOKUP).to.be.an("object");
    expect(constants.LABEL_TO_PROFILE_LOOKUP.Ferien).to.equal(
      "plannedVacations"
    );
    expect(
      constants.LABEL_TO_PROFILE_LOOKUP["Militär / Mutterschaft / Diverses"]
    ).to.equal("plannedMixed");
  });

  it("should export DAY_TO_HOURS_ELEMENTS array", () => {
    expect(constants.DAY_TO_HOURS_ELEMENTS).to.be.an("array");
    expect(constants.DAY_TO_HOURS_ELEMENTS).to.contain(
      "transferGrantedVacations"
    );
    expect(constants.DAY_TO_HOURS_ELEMENTS).to.contain("plannedVacations");
  });

  it("should export DAY_TO_HOURS_ELEMENTS_2025 array", () => {
    expect(constants.DAY_TO_HOURS_ELEMENTS_2025).to.be.an("array");
    expect(constants.DAY_TO_HOURS_ELEMENTS_2025).to.contain(
      "transferGrantedVacations"
    );
    expect(constants.DAY_TO_HOURS_ELEMENTS_2025).to.contain("plannedVacations");
    // Should have fewer elements than DAY_TO_HOURS_ELEMENTS
    expect(constants.DAY_TO_HOURS_ELEMENTS_2025.length).to.be.lessThan(
      constants.DAY_TO_HOURS_ELEMENTS.length
    );
  });

  it("should export INDICATOR_TO_REPORTS_LOOKUP mapping", () => {
    expect(constants.INDICATOR_TO_REPORTS_LOOKUP).to.be.an("object");
    expect(constants.INDICATOR_TO_REPORTS_LOOKUP.Ferien).to.equal(
      "totalVacationsForYear"
    );
    expect(
      constants.INDICATOR_TO_REPORTS_LOOKUP["Militär / Mutterschaft / Diverses"]
    ).to.equal("totalMixed");
  });
});
