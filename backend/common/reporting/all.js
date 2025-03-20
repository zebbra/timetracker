const _ = require("lodash");
const async = require("async");
const moment = require("moment-timezone");

const formatters = require("../formatters");
const { fetchProfiles } = require("./helpers");
const indicatorReporting = require("./indicator");
const elementsReporting = require("./elements");
const timeseriesReporting = require("./timeseries");

moment.locale("de");

const fetchAll = (models, params, callback) => {
  const { start, end, userId } = params;

  if (!start || !end || !userId)
    return callback(
      new Error("missing parameters (start, end, and userId are mandatory")
    );

  if (!start.isSame(end, "year"))
    return callback(new Error("invalid range (multiple years)"));

  const getProfile = next => {
    fetchProfiles(
      models["employment-profile"],
      {
        year: start.year(),
        userId
      },
      (err, profiles) => {
        if (err) return next(err);
        return next(null, _.head(profiles));
      }
    );
  };

  return async.parallel(
    {
      getIndicators: next => indicatorReporting(models, params, next),
      getTimeseries: next => timeseriesReporting(models, params, next),
      getElements: next => elementsReporting(models, params, next),
      getProfile
    },
    (err, data) => {
      if (err) {
        return callback(err);
      }

      const {
        getIndicators: rawIndicators,
        getTimeseries: timeseries,
        getElements: elements,
        getProfile: profile
      } = data;

      if (!profile) {
        const error = new Error("Kein Anstellungsprofil gefunden");
        error.status = 400;
        error.statusCode = 400;
        return callback(error);
      }

      const report = {
        reportingPeriod: {
          type: "all",
          start,
          end,
          profile: profile.id
        },
        reports: {},
        indicators: rawIndicators,
        elements,
        timeseries
      };

      const indicators = {
        Ferien: {
          actual: 0
        },
        "Militär / Mutterschaft / Diverses": {
          actual: 0
        },
        "Bew. Nachqual.": {
          actual: 0
        },
        Treueprämien: {
          actual: 0
        },
        "Besondere Abwesenheiten": {
          actual: 0
        },
        Krankheit: {
          actual: 0
        }
      };

      _.extend(
        indicators,
        _.mapValues(_.groupBy(rawIndicators.data, "label"), _.head)
      );

      let totalLectureshipLessionsTarget = 0;
      let totalLectureshipHoursTarget = 0;
      let totalLectureshipHoursActual = 0;

      // Filter out elements which we do not want to report in generic elements report
      const elementsToReport = _.filter(
        elements.data,
        entry => !_.includes(["Default"], entry.project)
      );

      elementsToReport.forEach(element => {
        // add to total counters
        if (element.unit === "l")
          totalLectureshipLessionsTarget += element.targetLession;

        totalLectureshipHoursTarget += element.target;
        totalLectureshipHoursActual += element.actual;
      });

      totalLectureshipLessionsTarget = formatters.asDecimal(
        totalLectureshipLessionsTarget
      );
      totalLectureshipHoursTarget = formatters.asDecimal(
        totalLectureshipHoursTarget
      );
      totalLectureshipHoursActual = formatters.asDecimal(
        totalLectureshipHoursActual
      );

      const totalVacationsForYearTarget = indicators.Ferien.targetHours;
      const totalVacationsForYearActual = indicators.Ferien.actualHours;

      const totalTransferTimeTarget = formatters.asDecimal(
        profile.transferGrantedOvertime + profile.transferOvertime
      );
      const totalTransferTimeActual = 0;

      const totalTransferVacationsTarget =
        indicators.Ferien.transferGrantedVacationsHours;
      const totalTransferVacationsActual = 0;

      const totalMixedTarget =
        indicators["Militär / Mutterschaft / Diverses"].targetHours;
      const totalMixedActual =
        indicators["Militär / Mutterschaft / Diverses"].actualHours;

      const totalQualiTarget = indicators["Bew. Nachqual."].targetHours;
      const totalQualiActual = indicators["Bew. Nachqual."].actualHours;

      const totalPremiumsTarget = indicators.Treueprämien.targetHours;
      const totalPremiumsActual = indicators.Treueprämien.actualHours;

      const totalSpecialAbsencesTarget = 0;
      const totalSpecialAbsencesActual =
        indicators["Besondere Abwesenheiten"].actual;

      const totalSicknessTarget = 0;
      const totalSicknessActual = indicators.Krankheit.actual;

      const totalHoursTarget = timeseries.total.target;
      const totalHoursActual = timeseries.total.currentActual;

      const totalWorkingHoursForYearNetTarget = formatters.asDecimal(
        totalHoursTarget - totalVacationsForYearTarget
      );
      const totalWorkingHoursForYearNetActual = formatters.asDecimal(
        totalHoursActual - totalVacationsForYearActual
      );

      const totalWorkingHoursForYearEffectivelyTarget = formatters.asDecimal(
        totalWorkingHoursForYearNetTarget -
          totalTransferTimeTarget -
          totalTransferVacationsTarget -
          totalMixedTarget -
          totalQualiTarget -
          totalPremiumsTarget -
          totalSpecialAbsencesTarget -
          totalSicknessTarget
      );

      const totalWorkingHoursForYearEffectivelyActual = formatters.asDecimal(
        totalWorkingHoursForYearNetActual -
          totalMixedActual -
          totalQualiActual -
          totalPremiumsActual -
          totalSpecialAbsencesActual -
          totalSicknessActual
      );

      const totalSaldoTarget = formatters.asDecimal(
        totalWorkingHoursForYearEffectivelyTarget - totalLectureshipHoursTarget
      );

      const totalSaldoActual = formatters.asDecimal(
        totalWorkingHoursForYearEffectivelyActual - totalLectureshipHoursActual
      );

      report.reports = {
        ...timeseries.total,
        totalHoursTarget,
        totalHoursActual,
        totalVacationsForYearTarget,
        totalVacationsForYearActual,
        totalWorkingHoursForYearNetTarget,
        totalWorkingHoursForYearNetActual,
        totalTransferTimeTarget,
        totalTransferTimeActual,
        totalTransferVacationsTarget,
        totalTransferVacationsActual,
        totalMixedTarget,
        totalMixedActual,
        totalQualiTarget,
        totalQualiActual,
        totalPremiumsTarget,
        totalPremiumsActual,
        totalSpecialAbsencesTarget,
        totalSpecialAbsencesActual,
        totalSicknessTarget,
        totalSicknessActual,
        totalWorkingHoursForYearEffectivelyTarget,
        totalWorkingHoursForYearEffectivelyActual,
        totalLectureshipLessionsTarget,
        totalLectureshipHoursTarget,
        totalLectureshipHoursActual,
        totalSaldoTarget,
        totalSaldoActual,
        indicators
      };

      return callback(null, report);
    }
  );
};

module.exports = fetchAll;
