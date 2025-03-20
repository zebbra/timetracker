/* global describe it beforeEach afterEach */
const expect = require("expect.js");
const moment = require("moment-timezone");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");
const helpers = require("../../common/reporting/helpers");

describe("Elements Reporting", () => {
  let sandbox;
  let mockModels;
  let mockElements;
  let mockSetpoints;
  let elementsReporting;

  // Setup test data
  const userId = "user123";
  const start = moment("2025-01-01");
  const end = moment("2025-12-31");

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock elements with tracks
    mockElements = [
      {
        label: "Element 1",
        toJSON: () => ({
          id: "elem1",
          factor: 1.5,
          unit: "l",
          label: "Element 1",
          project: "Project A",
          tracks: [
            { date: "2025-02-01", duration: 7200, value: 2 }, // 2 hours
            { date: "2025-03-15", duration: 10800, value: 3 } // 3 hours
          ]
        })
      },
      {
        label: "Element 2",
        toJSON: () => ({
          id: "elem2",
          factor: 1,
          unit: "h",
          label: "Element 2",
          project: "Project B",
          tracks: [
            { date: "2025-04-10", duration: 14400, value: 4 } // 4 hours
          ]
        })
      }
    ];

    // Mock setpoints data
    mockSetpoints = [
      { elementId: "elem1", value: 50 },
      { elementId: "elem2", value: 100 }
    ];

    // Mock models with find method
    mockModels = {
      element: {},
      setpoint: {}
    };

    // Stub the helper functions correctly
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
      .stub(helpers, "fetchSetpoints")
      .callsFake((model, params, callback) => {
        callback(null, mockSetpoints);
      });

    elementsReporting = proxyquire("../../common/reporting/elements", {
      "./helpers": helpers
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return error when missing required parameters", done => {
    // Missing userId
    elementsReporting(mockModels, { start, end }, err => {
      expect(err).to.be.an(Error);
      expect(err.message).to.contain("missing parameters");
      done();
    });
  });

  it("should return error when date range spans multiple years", done => {
    const multiYearStart = moment("2024-12-01");
    const multiYearEnd = moment("2025-01-31");

    elementsReporting(
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
    elementsReporting(mockModels, { start, end, userId }, (err, report) => {
      expect(err).to.be(null);
      expect(report).to.be.an("object");
      expect(report.reportingPeriod).to.be.an("object");
      expect(report.reportingPeriod.type).to.equal("elements");
      expect(report.data).to.be.an("array");
      expect(report.data.length).to.equal(2);

      // Check first element data
      const elem1 = report.data[0];
      expect(elem1.id).to.equal("elem1");
      expect(elem1.target).to.equal(75); // 50 * 1.5
      expect(elem1.targetLession).to.equal(50);

      // Check second element data
      const elem2 = report.data[1];
      expect(elem2.id).to.equal("elem2");
      expect(elem2.target).to.equal(100); // 100 * 1
      expect(elem2.targetLession).to.be(null); // Not a lesson type

      done();
    });
  });

  it("should include raw data when includeRaw is true", done => {
    elementsReporting(
      mockModels,
      { start, end, userId, includeRaw: true },
      (err, report) => {
        expect(err).to.be(null);
        expect(report.raw).to.be.an("object");

        // Check for raw data entries
        const dateKeys = Object.keys(report.raw);
        expect(dateKeys.length).to.be.greaterThan(0);

        // Verify data for a specific date
        const firstDateKey = dateKeys[0];
        const firstDateEntries = report.raw[firstDateKey];
        expect(firstDateEntries).to.be.an("array");
        expect(firstDateEntries[0]).to.have.property("label");
        expect(firstDateEntries[0]).to.have.property("duration");

        done();
      }
    );
  });

  it("should return flat array when flat is true", done => {
    elementsReporting(
      mockModels,
      { start, end, userId, flat: true },
      (err, data) => {
        expect(err).to.be(null);
        expect(Array.isArray(data)).to.be(true);
        expect(data.length).to.equal(2);

        // Check first element
        expect(data[0]).to.have.property("id");
        expect(data[0]).to.have.property("actual");
        expect(data[0]).to.have.property("target");

        done();
      }
    );
  });

  it("should return only data for a specific element if position is provided", done => {
    const position = "Element 1";

    elementsReporting(
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
