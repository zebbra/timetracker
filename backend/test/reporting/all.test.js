/* global describe it beforeEach afterEach */
const expect = require("expect.js");
const moment = require("moment-timezone");
const _ = require("lodash");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");
const helpers = require("../../common/reporting/helpers");

describe("All Reporting", () => {
  let sandbox;
  let fetchAll;
  let mockModels;
  let mockProfile;
  let mockElementsReport;
  let mockElementsReporting;
  let mockIndicatorsReport;
  let mockIndicatorsReporting;
  let mockTimeseriesReport;
  let mockTimeseriesReporting;

  // Setup test data
  const userId = "user123";
  const start = moment("2025-01-01");
  const end = moment("2025-12-31");

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock profile
    mockProfile = {
      id: "profile1",
      transferGrantedOvertime: 15 * 3600, // 15 hours in seconds
      transferOvertime: 5 * 3600 // 5 hours in seconds
    };

    // Mock elements report
    mockElementsReport = {
      reportingPeriod: {
        type: "elements",
        start,
        end
      },
      data: [
        {
          id: "elem1",
          label: "Element 1",
          project: "Project A",
          unit: "l",
          target: 75,
          targetLession: 50,
          actual: 70,
          factor: 1.5
        },
        {
          id: "elem2",
          label: "Element 2",
          project: "Project B",
          unit: "h",
          target: 100,
          actual: 95
        }
      ],
      raw: {
        "20250201": [
          {
            label: "Element 1",
            duration: 7200,
            unit: "l",
            value: 2
          }
        ]
      }
    };

    // Mock indicators report
    mockIndicatorsReport = {
      reportingPeriod: {
        type: "indicators",
        start,
        end
      },
      data: [
        {
          id: "ind1",
          label: "Ferien",
          unit: "d",
          actual: 3,
          target: 25,
          saldo: 22,
          actualHours: 25.2,
          targetHours: 210
        },
        {
          id: "ind2",
          label: "Militär / Mutterschaft / Diverses",
          unit: "d",
          actual: 5,
          target: 10,
          saldo: 5,
          actualHours: 42,
          targetHours: 84
        }
      ]
    };

    // Mock timeseries report
    mockTimeseriesReport = {
      reportingPeriod: {
        type: "timeseries",
        start,
        end
      },
      total: {
        currentActual: 1750,
        currentTarget: 1800,
        currentSaldo: -50,
        target: 1800
      },
      data: [
        [
          1735689600000, // timestamp
          8.4, // dailyActual
          "8.40", // dailyActualFixed
          8.4, // dailyTarget
          0, // dailySaldo
          8.4, // currentActual
          8.4, // currentTarget
          0, // currentSaldo
          8.4, // target
          1 // scope
        ]
      ]
    };

    // Mock models
    mockModels = {
      element: {},
      employment: {},
      "employment-profile": {},
      holiday: {}
    };

    // Stub helpers methods
    sandbox
      .stub(helpers, "fetchProfiles")
      .callsFake((model, params, callback) => {
        callback(null, [mockProfile]);
      });

    // Stub the module functions properly
    mockElementsReporting = sandbox
      .stub()
      .callsFake((models, params, callback) => {
        if (params.position) {
          callback(null, {
            ...mockElementsReport,
            data: mockElementsReport.data.filter(
              e => e.label === params.position
            ),
            raw: _.pick(mockElementsReport.raw, params.position)
          });
        } else {
          callback(null, mockElementsReport);
        }
      });

    mockIndicatorsReporting = sandbox
      .stub()
      .callsFake((models, params, callback) => {
        if (params.position) {
          callback(null, {
            ...mockIndicatorsReport,
            data: mockIndicatorsReport.data.filter(
              e => e.label === params.position
            )
          });
        } else {
          callback(null, mockIndicatorsReport);
        }
      });

    mockTimeseriesReporting = sandbox
      .stub()
      .callsFake((models, params, callback) => {
        callback(null, mockTimeseriesReport);
      });

    fetchAll = proxyquire("../../common/reporting/all", {
      "./helpers": helpers,
      "../../common/reporting/elements": mockElementsReporting,
      "../../common/reporting/indicator": mockIndicatorsReporting,
      "../../common/reporting/timeseries": mockTimeseriesReporting
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return error when missing required parameters", done => {
    // Missing userId
    fetchAll(mockModels, { start, end }, err => {
      expect(err).to.be.an(Error);
      expect(err.message).to.contain("missing parameters");
      done();
    });
  });

  it("should return error when date range spans multiple years", done => {
    const multiYearStart = moment("2024-12-01");
    const multiYearEnd = moment("2025-01-31");

    fetchAll(
      mockModels,
      { start: multiYearStart, end: multiYearEnd, userId },
      err => {
        expect(err).to.be.an(Error);
        expect(err.message).to.contain("invalid range");
        done();
      }
    );
  });

  it("should generate a comprehensive report with all modules", done => {
    fetchAll(mockModels, { start, end, userId }, (err, report) => {
      expect(err).to.be(null);
      expect(report).to.be.an("object");

      // Check report structure
      expect(report.reportingPeriod).to.be.an("object");
      expect(report.reportingPeriod.type).to.equal("all");
      expect(report.reportingPeriod.profile).to.equal("profile1");

      // Check that all the individual reports are included
      expect(report.elements).to.be.an("object");
      expect(report.timeseries).to.be.an("object");
      expect(report.indicators).to.be.an("object");

      // Check the derived reports object
      expect(report.reports).to.be.an("object");

      // Check specific calculated values
      expect(report.reports.totalHoursTarget).to.equal(1800);
      expect(report.reports.totalHoursActual).to.equal(1750);
      expect(report.reports.totalVacationsForYearTarget).to.equal(210);
      expect(report.reports.totalVacationsForYearActual).to.equal(25.2);

      // Verify derived calculations
      expect(report.reports.totalWorkingHoursForYearNetTarget).to.equal(1590); // 1800 - 210
      expect(report.reports.totalWorkingHoursForYearNetActual).to.equal(1724.8); // 1750 - 25.2

      done();
    });
  });

  it("should return a report with elements filtered by position", done => {
    const params = {
      start,
      end,
      userId,
      position: "Element 1"
    };

    fetchAll(mockModels, params, (err, report) => {
      expect(err).to.be(null);

      // Verify that only elements from Project A are included
      expect(report.elements.data.length).to.equal(1);
      expect(report.elements.data[0].project).to.equal("Project A");

      done();
    });
  });

  it("should return a report with indicators filtered by position", done => {
    const params = {
      start,
      end,
      userId,
      position: "Ferien"
    };

    fetchAll(mockModels, params, (err, report) => {
      expect(err).to.be(null);

      // Verify that only the "Ferien" indicator is included
      expect(report.indicators.data.length).to.equal(1);
      expect(report.indicators.data[0].label).to.equal("Ferien");

      done();
    });
  });

  it("should pass through parameters correctly to child reporting modules", done => {
    const params = {
      start,
      end,
      userId,
      includeRaw: true,
      enhanced: true
    };

    fetchAll(mockModels, params, (err, report) => {
      expect(err).to.be(null);

      // Verify each reporting module was called with the correct parameters
      expect(mockElementsReporting.calledWith(mockModels, params)).to.be(true);
      expect(mockIndicatorsReporting.calledWith(mockModels, params)).to.be(
        true
      );
      expect(mockTimeseriesReporting.calledWith(mockModels, params)).to.be(
        true
      );

      done();
    });
  });
});
