/* global describe it beforeEach afterEach */
const expect = require("expect.js");
const moment = require("moment-timezone");
const _ = require("lodash");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");
const helpers = require("../../common/reporting/helpers");

describe("CSV Reporting", () => {
  let sandbox;
  let mockModels;
  let mockEmployments;
  let mockAllReportData;
  let mockAllReportingData;
  let csvReporting;

  // Setup test data
  const userId = "user123";
  const start = moment("2025-01-01");
  const end = moment("2025-12-31");

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock employments
    mockEmployments = [
      {
        start: moment("2025-01-01"),
        end: moment("2025-06-30"),
        scope: 80
      }
    ];

    // Mock elements data
    const mockElements = {
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
        ],
        "20250410": [
          {
            label: "Element 2",
            duration: 14400,
            unit: "h",
            value: 4
          }
        ]
      }
    };

    // Mock timeseries data
    const mockTimeseries = {
      total: {
        currentActual: 120,
        currentTarget: 130,
        currentSaldo: -10,
        target: 180
      },
      raw: {
        "20250201": [
          {
            label: "Von-Bis",
            duration: 28800,
            unit: "h",
            value: "08:00-17:00"
          }
        ],
        "20250301": [
          {
            label: "Ferien",
            duration: 30240,
            unit: "d",
            value: 1
          }
        ]
      }
    };

    // Mock reports data
    const mockReports = {
      totalVacationsForYearActual: 20,
      totalVacationsForYearTarget: 25,
      totalHoursActual: 1750,
      totalHoursTarget: 1800,
      totalWorkingHoursForYearNetActual: 1730,
      totalWorkingHoursForYearNetTarget: 1775,
      totalTransferTimeActual: 0,
      totalTransferTimeTarget: 10,
      totalTransferVacationsActual: 0,
      totalTransferVacationsTarget: 8,
      totalMixedActual: 15,
      totalMixedTarget: 15,
      totalQualiActual: 30,
      totalQualiTarget: 40,
      totalPremiumsActual: 5,
      totalPremiumsTarget: 5,
      totalSpecialAbsencesActual: 2,
      totalSpecialAbsencesTarget: 0,
      totalSicknessActual: 3,
      totalSicknessTarget: 0,
      totalWorkingHoursForYearEffectivelyActual: 1675,
      totalWorkingHoursForYearEffectivelyTarget: 1697,
      totalLectureshipLessionsTarget: 50,
      totalLectureshipHoursActual: 165,
      totalLectureshipHoursTarget: 175,
      totalSaldoActual: 1510,
      totalSaldoTarget: 1522,
      indicators: {
        Ferien: { actual: 20, target: 25 },
        "Militär / Mutterschaft / Diverses": {
          actual: 15,
          target: 15
        },
        "Bew. Nachqual.": { actual: 30, target: 40 },
        Treueprämien: { actual: 5, target: 5 },
        "Besondere Abwesenheiten": { actual: 2, target: 0 },
        Krankheit: { actual: 3, target: 0 }
      }
    };

    // Combined mock data
    mockAllReportData = {
      elements: mockElements,
      timeseries: mockTimeseries,
      reports: mockReports
    };

    // Mock models
    mockModels = {
      element: {},
      employment: {},
      "employment-profile": {},
      holiday: {}
    };

    // Stub the helper functions correctly
    sandbox
      .stub(helpers, "fetchEmployments")
      .callsFake((model, params, callback) => {
        callback(null, mockEmployments);
      });

    mockAllReportingData = sandbox
      .stub()
      .callsFake((model, params, callback) => {
        if (params.position) {
          callback(null, {
            elements: {
              data: mockAllReportData.elements.data.filter(
                elem => elem.label === params.position
              ),
              raw: _.pick(mockAllReportData.elements.raw, params.position)
            },
            timeseries: {
              ...mockAllReportData.timeseries,
              raw: _.pickBy(mockAllReportData.timeseries.raw, value =>
                value.find(elem => elem.label === params.position)
              )
            },
            reports: {
              ...mockAllReportData.reports,
              indicators: mockAllReportData.reports.indicators[params.position]
                ? {
                    [params.position]:
                      mockAllReportData.reports.indicators[params.position]
                  }
                : {}
            }
          });
        } else {
          callback(null, mockAllReportData);
        }
      });

    csvReporting = proxyquire("../../common/reporting/csv", {
      "./helpers": helpers,
      "./all": mockAllReportingData
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return error when missing required parameters", done => {
    // Missing userId
    csvReporting(mockModels, { start, end }, err => {
      expect(err).to.be.an(Error);
      expect(err.message).to.contain("missing parameters");
      done();
    });
  });

  it("should return error when date range spans multiple years", done => {
    const multiYearStart = moment("2024-12-01");
    const multiYearEnd = moment("2025-01-31");

    csvReporting(
      mockModels,
      { start: multiYearStart, end: multiYearEnd, userId },
      err => {
        expect(err).to.be.an(Error);
        expect(err.message).to.contain("invalid range");
        done();
      }
    );
  });

  it("should return error if flat and comments parameters are used together", done => {
    csvReporting(
      mockModels,
      { start, end, userId, flat: true, includeComments: true },
      err => {
        expect(err).to.be.an(Error);
        expect(err.message).to.contain(
          "aggregated and comments are mutually exclusive"
        );
        done();
      }
    );
  });

  it("should return error if flat and compact parameters are used together", done => {
    csvReporting(
      mockModels,
      { start, end, userId, flat: true, compact: true },
      err => {
        expect(err).to.be.an(Error);
        expect(err.message).to.contain(
          "aggregated and compact are mutually exclusive"
        );
        done();
      }
    );
  });

  it("should return an error if position and comments parameters are used together", done => {
    csvReporting(
      mockModels,
      { start, end, userId, position: "Ferien", includeComments: true },
      err => {
        expect(err).to.be.an(Error);
        expect(err.message).to.contain(
          "position and comments are mutually exclusive"
        );
        done();
      }
    );
  });

  it("should generate CSV rows with default parameters", done => {
    csvReporting(mockModels, { start, end, userId }, (err, rows) => {
      expect(err).to.be(null);
      expect(rows).to.be.an("array");

      // Check that the report has the expected structure
      expect(rows.length).to.be.greaterThan(0);

      // The first row should be headers
      expect(rows[0][0]).to.equal("Project A");

      // Check that we have titles for main sections
      const titles = rows
        .filter(
          row =>
            row[1] === null &&
            row[2] === null &&
            row[3] === null &&
            row[4] === null
        )
        .map(row => row[0]);

      expect(titles).to.contain("Total");
      expect(titles).to.contain("Jahresarbeitszeit Effektiv");
      expect(titles).to.contain("Finale Zusammenfassung");

      done();
    });
  });

  it("should handle flat parameter correctly", done => {
    csvReporting(
      mockModels,
      { start, end, userId, flat: true },
      (err, rows) => {
        expect(err).to.be(null);
        expect(rows).to.be.an("array");

        // In flat mode, the first row should have 5 columns (Element, Soll [L], Soll [h], Ist [h], Saldo)
        expect(rows[0].length).to.equal(5);
        expect(rows.length).to.be.equal(35);

        done();
      }
    );
  });

  it("should filter by position when position parameter is provided", done => {
    // Position that exists in the mock data
    const position = "Ferien";

    csvReporting(mockModels, { start, end, userId, position }, (err, rows) => {
      expect(err).to.be(null);
      expect(rows).to.be.an("array");

      // Should only return headers and one row for the specific position
      expect(rows.length).to.equal(2);
      expect(rows[0][0]).to.equal("Position");
      expect(rows[1][0]).to.equal(position);

      done();
    });
  });

  it("should filter by position when position parameter is provided and compact the results", done => {
    // Position that exists in the mock data
    const position = "Ferien";

    csvReporting(
      mockModels,
      { start, end, userId, position, compact: true },
      (err, rows) => {
        expect(err).to.be(null);
        expect(rows).to.be.an("array");

        // Should only return headers and one row for the specific position
        expect(rows.length).to.equal(2);
        expect(rows[0][0]).to.equal("Position");
        expect(rows[1][0]).to.equal("Ferien");
        expect(rows[1][1]).to.equal("-8.40");
        expect(rows[1][2]).to.equal(null);
        expect(rows[1][3]).to.equal(25);
        expect(rows[1][4]).to.equal(20);
        expect(rows[1][5]).to.equal(5);

        done();
      }
    );
  });

  it("should geneate CSV rows for active days only if compact parameter is provided", done => {
    csvReporting(
      mockModels,
      { start, end, userId, compact: true },
      (err, rows) => {
        expect(err).to.be(null);
        expect(rows).to.be.an("array");

        // Include all positions
        expect(rows.length).to.be.equal(35);
        rows.forEach(row => {
          expect(row.length).to.be.within(5, 8);
        });

        done();
      }
    );
  });

  it("should return error when position parameter is invalid", done => {
    // Position that doesn't exist in the mock data
    const position = "NonExistentPosition";

    csvReporting(mockModels, { start, end, userId, position }, err => {
      expect(err).to.be.an(Error);
      expect(err.message).to.contain(
        "Position NonExistentPosition is not valid"
      );

      done();
    });
  });
});
