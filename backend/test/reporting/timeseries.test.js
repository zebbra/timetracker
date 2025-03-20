/* global describe it beforeEach afterEach */
const expect = require("expect.js");
const moment = require("moment-timezone");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");
const helpers = require("../../common/reporting/helpers");

describe("Timeseries Reporting", () => {
  let sandbox;
  let mockModels;
  let mockElements;
  let mockHolidays;
  let mockEmployments;
  let mockProfiles;
  let timeseriesReporting;

  // Setup test data
  const userId = "user123";
  const start = moment("2025-01-01");
  const end = moment("2025-12-31");

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock elements with tracks
    mockElements = [
      {
        label: "Von-Bis",
        toJSON: () => ({
          id: "elem1",
          label: "Von-Bis",
          unit: "h",
          tracks: [
            { date: "2025-02-01", duration: 28800, value: "08:00-17:00" }, // 8 hours
            { date: "2025-02-02", duration: 25200, value: "09:00-16:00" } // 7 hours
          ]
        })
      },
      {
        label: "Ferien",
        toJSON: () => ({
          id: "elem2",
          label: "Ferien",
          unit: "d",
          tracks: [
            { date: "2025-03-01", duration: 30240, value: 1 } // 1 day
          ]
        })
      }
    ];

    // Mock holidays
    mockHolidays = [
      {
        date: "2025-05-01",
        label: "Labor Day",
        duration: 30240, // 8.4 hours in seconds
        value: 1
      }
    ];

    // Mock employments
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

    // Mock profiles
    mockProfiles = [
      {
        transferGrantedOvertime: 15 * 3600, // 15 hours in seconds
        transferOvertime: 5 * 3600 // 5 hours in seconds
      }
    ];

    // Mock models
    mockModels = {
      element: {},
      holiday: {},
      employment: {},
      "employment-profile": {}
    };

    // Create new stubs for the helpers module
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
      .stub(helpers, "fetchHolidays")
      .callsFake((model, params, callback) => {
        callback(null, mockHolidays);
      });
    sandbox
      .stub(helpers, "fetchEmployments")
      .callsFake((model, params, callback) => {
        callback(null, mockEmployments);
      });
    sandbox
      .stub(helpers, "fetchProfiles")
      .callsFake((model, params, callback) => {
        callback(null, mockProfiles);
      });

    // Load the module with the stubbed helpers
    timeseriesReporting = proxyquire("../../common/reporting/timeseries", {
      "./helpers": helpers
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return error when missing required parameters", done => {
    // Missing userId
    timeseriesReporting(mockModels, { start, end }, err => {
      expect(err).to.be.an(Error);
      expect(err.message).to.contain("missing parameters");
      done();
    });
  });

  it("should generate a proper timeseries report with default parameters", done => {
    timeseriesReporting(mockModels, { start, end, userId }, (err, report) => {
      expect(err).to.be(null);
      expect(report).to.be.an("object");
      expect(report.reportingPeriod).to.be.an("object");
      expect(report.reportingPeriod.type).to.equal("timeseries");

      // Check the total values
      expect(report.total).to.have.property("currentActual");
      expect(report.total).to.have.property("currentTarget");
      expect(report.total).to.have.property("currentSaldo");
      expect(report.total).to.have.property("target");

      // Check that data is an array of arrays (date, actual, target, saldo)
      expect(Array.isArray(report.data)).to.be(true);
      expect(report.data.length).to.be.greaterThan(0);
      expect(Array.isArray(report.data[0])).to.be(true);

      done();
    });
  });

  it("should include raw data when includeRaw is true", done => {
    timeseriesReporting(
      mockModels,
      { start, end, userId, includeRaw: true },
      (err, report) => {
        expect(err).to.be(null);
        expect(report.raw).to.be.an("object");

        // Raw data should have entries for both tracks
        expect(Object.keys(report.raw).length).to.equal(4);

        done();
      }
    );
  });

  it("should return timeseries filtered by position", done => {
    timeseriesReporting(
      mockModels,
      { start, end, userId, includeRaw: true, position: "Ferien" },
      (err, report) => {
        expect(err).to.be(null);
        expect(report.raw).to.be.an("object");

        // Raw data should have entries for Ferien only
        expect(Object.keys(report.raw).length).to.equal(1);
        expect(report.raw).to.have.property("20250301");

        done();
      }
    );
  });

  it("should handle asMap parameter correctly", done => {
    timeseriesReporting(
      mockModels,
      { start, end, userId, asMap: true },
      (err, report) => {
        expect(err).to.be(null);
        expect(report.data).to.be.an("object");

        // Check keys in data map (should be dates in format YYYYMMDD)
        const keys = Object.keys(report.data);
        expect(keys.length).to.be.greaterThan(0);
        expect(keys[0]).to.match(/^\d{8}$/); // YYYYMMDD format

        // Check data for a day
        const firstDay = report.data[keys[0]];
        expect(firstDay).to.have.property("dailyActual");
        expect(firstDay).to.have.property("dailyTarget");
        expect(firstDay).to.have.property("dailySaldo");
        expect(firstDay).to.have.property("scope");

        done();
      }
    );
  });

  it("should return flat array when flat is true", done => {
    timeseriesReporting(
      mockModels,
      { start, end, userId, flat: true },
      (err, data) => {
        expect(err).to.be(null);
        expect(Array.isArray(data)).to.be(true);

        // Check it's not the full report object but just the data array
        expect(data).not.to.have.property("reportingPeriod");
        expect(data).not.to.have.property("total");

        done();
      }
    );
  });

  it("should use yearScope parameter correctly", done => {
    // With yearScope true, it should use start of year to end of year
    timeseriesReporting(
      mockModels,
      {
        start: moment("2025-03-01"),
        end: moment("2025-09-30"),
        userId,
        yearScope: true
      },
      (err, report) => {
        expect(err).to.be(null);

        // Verify yearScope functionality by checking helper calls
        expect(helpers.fetchHolidays.calledOnce).to.be(true);
        const holidaysCallArgs = helpers.fetchHolidays.firstCall.args[1];

        // Should be called with start of year and end of year
        expect(holidaysCallArgs.start.format("YYYY-MM-DD")).to.equal(
          "2025-01-01"
        );
        expect(holidaysCallArgs.end.format("YYYY-MM-DD")).to.equal(
          "2025-12-31"
        );

        done();
      }
    );
  });
});
