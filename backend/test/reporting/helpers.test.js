/* global describe it */
const expect = require("expect.js");
const moment = require("moment-timezone");
const helpers = require("../../common/reporting/helpers");

describe("Reporting Helpers", () => {
  describe("employmentLookup", () => {
    const employments = [
      {
        start: moment("2025-01-01"),
        end: moment("2025-06-30"),
        scope: 50
      },
      {
        start: moment("2025-07-01"),
        end: null, // ongoing employment
        scope: 80
      }
    ];

    it("should return correct scope for date in first employment period", () => {
      const date = moment("2025-03-15");
      const scope = helpers.employmentLookup(employments, date);
      expect(scope).to.be(0.5); // 50% converted to decimal
    });

    it("should return correct scope for date in second employment period", () => {
      const date = moment("2025-08-15");
      const scope = helpers.employmentLookup(employments, date);
      expect(scope).to.be(0.8); // 80% converted to decimal
    });

    it("should return 0 for date before any employment", () => {
      const date = moment("2024-12-15");
      const scope = helpers.employmentLookup(employments, date);
      expect(scope).to.be(0);
    });

    it("should handle empty employment array", () => {
      const date = moment("2025-03-15");
      const scope = helpers.employmentLookup([], date);
      expect(scope).to.be(0);
    });
  });

  describe("calcWeekdays", () => {
    const employments = [
      {
        start: moment("2025-01-01"),
        end: moment("2025-12-31"),
        scope: 100
      }
    ];

    it("should calculate correct number of days and weekdays", () => {
      const range = {
        start: moment("2025-01-01"),
        end: moment("2025-01-07") // 1 week
      };

      const result = helpers.calcWeekdays(range, employments);

      // 7 days total
      expect(result.days).to.be(7);

      // 5 weekdays (excluding weekend)
      expect(result.weekdays).to.be(5);

      // Check that dates array has the right length
      expect(result.dates.length).to.be(7);

      // Check that weekdates array has the right length
      expect(result.weekdates.length).to.be(5);

      // Check lookup has entries for each day
      expect(Object.keys(result.lookup).length).to.be(7);
    });

    it("should handle invalid dates", () => {
      const range = {
        start: null,
        end: null
      };

      const result = helpers.calcWeekdays(range, employments);

      expect(result.days).to.be(0);
      expect(result.weekdays).to.be(0);
      expect(result.dates.length).to.be(0);
      expect(result.weekdates.length).to.be(0);
    });
  });

  describe("workingDaysForSelectedYear", () => {
    it("should calculate correct number of working days", () => {
      // Setup employment range for first half of 2025
      const range = {
        start: moment("2025-01-01"),
        end: moment("2025-06-30")
      };

      // Calculate working days for the range
      const workingDays = helpers.workingDaysForSelectedYear(range, 2025);

      // The exact number will depend on the calendar, but should be around 128 days
      // (approx 26 weeks × 5 weekdays, minus any holidays)
      expect(workingDays).to.be.above(120);
      expect(workingDays).to.be.below(135);
    });

    it("should handle custom start and end dates", () => {
      const range = {
        start: moment("2025-01-01"),
        end: moment("2025-12-31")
      };

      // Custom start/end limiting to Q1
      const customStart = moment("2025-01-01");
      const customEnd = moment("2025-03-31");

      const workingDays = helpers.workingDaysForSelectedYear(
        range,
        2025,
        customStart,
        customEnd
      );

      // Q1 2025 should have around 64 working days (13 weeks × 5 days, minus holidays)
      expect(workingDays).to.be.above(60);
      expect(workingDays).to.be.below(70);
    });
  });

  describe("getHouerlyElements", () => {
    it("should return DAY_TO_HOURS_ELEMENTS_2025 for years after 2024", () => {
      const elements = helpers.getHouerlyElements(2025);
      expect(elements).to.eql(
        require("../../common/reporting/constants").DAY_TO_HOURS_ELEMENTS_2025
      );
    });

    it("should return DAY_TO_HOURS_ELEMENTS for years before or equal to 2024", () => {
      const elements = helpers.getHouerlyElements(2024);
      expect(elements).to.eql(
        require("../../common/reporting/constants").DAY_TO_HOURS_ELEMENTS
      );
    });
  });
});
