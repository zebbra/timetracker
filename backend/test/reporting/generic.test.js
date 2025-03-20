/* global describe it beforeEach afterEach */
const expect = require("expect.js");
const moment = require("moment-timezone");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");

describe("Generic Reporting", () => {
  let sandbox;
  let mockModels;
  let mockAllReportData;
  let mockAllReportingData;
  let genericReporting;

  // Setup test data
  const userId = "user123";
  const start = moment("2025-01-01");
  const end = moment("2025-12-31");

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock reportingPeriod
    const mockReportingPeriod = {
      start,
      end,
      workingdays: 260,
      profile: {
        id: "profile1",
        year: 2025
      }
    };

    // Mock elements data
    const mockElements = {
      data: [
        {
          id: "elem1",
          label: "Element 1",
          project: "Unterrichts-Pool",
          unit: "l",
          target: 75,
          targetLession: 50,
          actual: 70,
          factor: 1.5
        },
        {
          id: "elem2",
          label: "Element 2",
          project: "Schulpool",
          unit: "h",
          target: 100,
          actual: 95
        },
        {
          id: "elem3",
          label: "Element 3",
          project: "Aufwand Weiterbildung und Dienstleistung",
          unit: "l",
          target: 60,
          targetLession: 40,
          actual: 55,
          factor: 1.5
        },
        {
          id: "elem4",
          label: "Element 4",
          project: "Default", // Should be filtered out
          unit: "h",
          target: 30,
          actual: 25
        }
      ]
    };

    // Mock reports data with all the required properties
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
      totalLectureshipLessionsTarget: 90,
      totalLectureshipHoursActual: 220,
      totalLectureshipHoursTarget: 235,
      totalSaldoActual: 1455,
      totalSaldoTarget: 1462
    };

    // Combined mock data
    mockAllReportData = {
      reportingPeriod: mockReportingPeriod,
      elements: mockElements,
      reports: mockReports
    };

    // Mock models
    mockModels = {
      element: {}
    };

    mockAllReportingData = sandbox
      .stub()
      .callsFake((model, params, callback) => {
        if (params.position) {
          callback(null, {
            ...mockAllReportData,
            elements: {
              data: mockAllReportData.elements.data.filter(
                elem => elem.label === params.position
              )
            }
          });
        } else {
          callback(null, mockAllReportData);
        }
      });

    genericReporting = proxyquire("../../common/reporting/generic", {
      "./all": mockAllReportingData
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should pass required parameters to fetchAll", done => {
    genericReporting(mockModels, { start, end, userId }, (err, report) => {
      expect(err).to.be(null);

      // Verify mockAllReportingData was called with correct parameters
      expect(mockAllReportingData.calledOnce).to.be(true);
      const calledParams = mockAllReportingData.firstCall.args[1];

      expect(calledParams.yearScope).to.be(true);
      expect(calledParams.enhanced).to.be(true);
      expect(calledParams.asMap).to.be(false);
      expect(calledParams.flat).to.be(false);
      expect(calledParams.includeRaw).to.be(false);

      done();
    });
  });

  it("should generate a proper generic report", done => {
    genericReporting(mockModels, { start, end, userId }, (err, report) => {
      expect(err).to.be(null);
      expect(report).to.be.an("object");

      // Check report structure
      expect(report.reportingPeriod).to.be.an("object");
      expect(report.reportingPeriod.type).to.equal("generic");
      expect(report.data).to.be.an("array");

      // Check that the report data sections are present
      expect(report.data.length).to.be.greaterThan(0);

      // Check that we have the expected sections
      const titles = report.data.map(section => section.title);
      expect(titles).to.contain("Unterrichts-Pool");
      expect(titles).to.contain("Schulpool");
      expect(titles).to.contain("Aufwand Weiterbildung und Dienstleistung");
      expect(titles).to.contain("Total");
      expect(titles).to.contain("Jahresarbeitszeit Effektiv");
      expect(titles).to.contain("Finale Zusammenfassung");

      // Verify Default project elements are filtered out
      const hasDefaultProject = report.data.some(
        section =>
          section.title === "Default" ||
          section.data.some(row => row[0] === "Element 4")
      );
      expect(hasDefaultProject).to.be(false);

      // Check the totals section
      const totalSection = report.data.find(
        section => section.title === "Total"
      );
      expect(totalSection).not.to.be(undefined); // eslint-disable-line no-undefined
      expect(totalSection.data.length).to.equal(4); // 3 project totals + final total

      // Check final row in totals
      const finalTotal = totalSection.data[3];
      expect(finalTotal[0]).to.equal(" = Total Lehrauftrag");

      // Check the final summary section
      const finalSummary = report.data.find(
        section => section.title === "Finale Zusammenfassung"
      );
      expect(finalSummary).not.to.be(undefined); // eslint-disable-line no-undefined
      expect(finalSummary.data.length).to.equal(3);

      // Check values in final summary
      const lectureshipTotal = finalSummary.data[0];
      expect(lectureshipTotal[1]).to.equal(90); // totalLectureshipLessionsTarget
      expect(lectureshipTotal[2]).to.equal(235); // totalLectureshipHoursTarget

      const workingHoursTotal = finalSummary.data[1];
      expect(workingHoursTotal[2]).to.equal(1697); // totalWorkingHoursForYearEffectivelyTarget

      const saldoTotal = finalSummary.data[2];
      expect(saldoTotal[2]).to.equal(1462); // totalSaldoTarget

      done();
    });
  });
});
