/* global describe it beforeEach afterEach */
const expect = require("expect.js");
const moment = require("moment-timezone");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");
const helpers = require("../../common/reporting/helpers");
const constants = require("../../common/reporting/constants");

describe("Indicator Reporting", () => {
  let sandbox;
  let mockModels;
  let mockElements;
  let mockProfiles;
  let mockEmployments;
  let indicatorReporting;

  // Setup test data
  const userId = "user123";
  const start = moment("2025-01-01");
  const end = moment("2025-12-31");

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock elements with tracks
    mockElements = [
      {
        label: "Ferien",
        toJSON: () => ({
          id: "elem1",
          label: "Ferien",
          unit: "d",
          tracks: [
            { date: "2025-02-15", value: 1 }, // 1 day
            { date: "2025-03-15", value: 2 } // 2 days
          ]
        })
      },
      {
        label: "Militär / Mutterschaft / Diverses",
        toJSON: () => ({
          id: "elem2",
          label: "Militär / Mutterschaft / Diverses",
          unit: "d",
          tracks: [
            { date: "2025-04-10", value: 5 } // 5 days
          ]
        })
      },
      {
        label: "Bew. Nachqual.",
        toJSON: () => ({
          id: "elem3",
          label: "Bew. Nachqual.",
          unit: "h",
          tracks: [
            { date: "2025-05-20", value: 16 } // 16 hours
          ]
        })
      },
      {
        label: "Treueprämien",
        toJSON: () => ({
          id: "elem4",
          label: "Treueprämien",
          unit: "d",
          tracks: [
            { date: "2025-06-01", value: 1 } // 1 day
          ]
        })
      },
      {
        label: "Besondere Abwesenheiten",
        toJSON: () => ({
          id: "elem5",
          label: "Besondere Abwesenheiten",
          unit: "d",
          tracks: [
            { date: "2025-07-05", value: 0.5 } // half day
          ]
        })
      },
      {
        label: "Krankheit",
        toJSON: () => ({
          id: "elem6",
          label: "Krankheit",
          unit: "d",
          tracks: [
            { date: "2025-08-12", value: 1 } // 1 day
          ]
        })
      },
      {
        label: "Not an indicator",
        toJSON: () => ({
          id: "elem7",
          label: "Not an indicator", // This shouldn't be included in report
          unit: "h",
          tracks: [
            { date: "2025-09-01", value: 8 } // 8 hours
          ]
        })
      }
    ];

    // Mock profiles
    mockProfiles = [
      {
        toJSON: () => ({
          transferGrantedVacations: 3, // 3 days transferred vacation
          plannedVacations: 25, // 25 days planned vacation
          plannedMixed: 10, // 10 days planned mixed leave
          plannedQuali: 40, // 40 hours planned qualification
          plannedPremiums: 2, // 2 days planned premium
          plannedSpecialAbsences: 0, // 0 days planned special absences
          plannedIllness: 0 // 0 days planned illness
        })
      }
    ];

    // Mock employments for enhanced mode
    mockEmployments = [
      {
        start: moment("2025-01-01"),
        end: moment("2025-06-30"),
        scope: 80
      },
      {
        start: moment("2025-07-01"),
        end: null, // ongoing employment
        scope: 100
      }
    ];

    // Mock models
    mockModels = {
      element: {},
      "employment-profile": {},
      employment: {}
    };

    // Stub helpers methods
    sandbox
      .stub(helpers, "fetchElements")
      .callsFake((model, params, callback) => {
        if (params.label) {
          callback(
            null,
            mockElements.filter(e => e.label === params.label)
          );
        } else {
          callback(null, mockElements);
        }
      });

    sandbox
      .stub(helpers, "fetchProfiles")
      .callsFake((model, params, callback) => {
        callback(null, mockProfiles);
      });

    sandbox
      .stub(helpers, "fetchEmployments")
      .callsFake((model, params, callback) => {
        callback(null, mockEmployments);
      });

    // Stub calcEmploymentScopes to return predictable results
    sandbox.stub(helpers, "calcEmploymentScopes").returns([
      { workingDays: 130, scope: 0.8 }, // 80% for first half year
      { workingDays: 131, scope: 1.0 } // 100% for second half year
    ]);

    // Stub applyEmploymentScopes to return predictable results
    sandbox
      .stub(helpers, "applyEmploymentScopes")
      .callsFake((value, weekdays, scopes) => {
        // Simple implementation for test purposes
        return value * constants.HOURS_PER_DAY * 0.9; // Approximating the weighted average
      });

    indicatorReporting = proxyquire("../../common/reporting/indicator", {
      "./helpers": helpers
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return error when missing required parameters", done => {
    // Missing userId
    indicatorReporting(mockModels, { start, end }, err => {
      expect(err).to.be.an(Error);
      expect(err.message).to.contain("missing parameters");
      done();
    });
  });

  it("should return error when date range spans multiple years", done => {
    const multiYearStart = moment("2024-12-01");
    const multiYearEnd = moment("2025-01-31");

    indicatorReporting(
      mockModels,
      { start: multiYearStart, end: multiYearEnd, userId },
      err => {
        expect(err).to.be.an(Error);
        expect(err.message).to.contain("invalid range");
        done();
      }
    );
  });

  it("should generate a proper report with default parameters", done => {
    indicatorReporting(mockModels, { start, end, userId }, (err, report) => {
      expect(err).to.be(null);
      expect(report).to.be.an("object");
      expect(report.reportingPeriod).to.be.an("object");
      expect(report.reportingPeriod.type).to.equal("indicators");
      expect(report.data).to.be.an("array");

      // Should only include elements defined in LABEL_TO_PROFILE_LOOKUP
      expect(report.data.length).to.equal(6);

      // Check that each indicator has the expected properties
      report.data.forEach(indicator => {
        expect(indicator).to.have.property("actual");
        expect(indicator).to.have.property("target");
        expect(indicator).to.have.property("saldo");

        // Verify the indicator is one we expect
        expect(constants.LABEL_TO_PROFILE_LOOKUP).to.have.property(
          indicator.label
        );
      });

      // Verify that "Not an indicator" element was not included
      const nonIndicator = report.data.find(
        item => item.label === "Not an indicator"
      );
      expect(nonIndicator).to.be(undefined); // eslint-disable-line no-undefined

      done();
    });
  });

  it("should calculate correct values in enhanced mode", done => {
    indicatorReporting(
      mockModels,
      { start, end, userId, enhanced: true },
      (err, report) => {
        expect(err).to.be(null);

        // Check each indicator has enhanced properties
        report.data.forEach(indicator => {
          expect(indicator).to.have.property("actualHours");
          expect(indicator).to.have.property("targetHours");
        });

        // Verify values for Ferien (vacation) indicator
        const vacation = report.data.find(item => item.label === "Ferien");
        expect(vacation).not.to.be(undefined); // eslint-disable-line no-undefined
        expect(vacation).to.have.property("transferGrantedVacations", 3);

        // Check that day values are correctly converted to hours
        const daysIndicators = report.data.filter(item => item.unit === "d");
        daysIndicators.forEach(indicator => {
          expect(indicator.actualHours).not.to.equal(indicator.actual);
        });

        done();
      }
    );
  });

  it("should include raw data when includeRaw is true", done => {
    indicatorReporting(
      mockModels,
      { start, end, userId, includeRaw: true },
      (err, report) => {
        expect(err).to.be(null);
        expect(report.raw).to.be.an("object");

        // Check that raw data is indexed by date
        const dateKeys = Object.keys(report.raw);
        expect(dateKeys.length).to.be.greaterThan(0);
        expect(dateKeys[0]).to.match(/^\d{8}$/); // YYYYMMDD format

        done();
      }
    );
  });

  it("should return flat array when flat is true", done => {
    indicatorReporting(
      mockModels,
      { start, end, userId, flat: true },
      (err, data) => {
        expect(err).to.be(null);
        expect(Array.isArray(data)).to.be(true);

        // Should only include indicators
        expect(data.length).to.equal(6);

        // Each item should be an indicator with the expected properties
        data.forEach(indicator => {
          expect(indicator).to.have.property("label");
          expect(indicator).to.have.property("actual");
          expect(indicator).to.have.property("target");
          expect(indicator).to.have.property("saldo");
        });

        done();
      }
    );
  });

  it("should return only data for a specific element if position is provided", done => {
    const position = "Ferien";

    indicatorReporting(
      mockModels,
      { start, end, userId, position },
      (err, report) => {
        expect(err).to.be(null);
        expect(report.data.length).to.equal(1);
        expect(report.data[0].label).to.equal(position);

        done();
      }
    );
  });
});
