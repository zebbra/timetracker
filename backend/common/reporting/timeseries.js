const _ = require("lodash");
const async = require("async");
const moment = require("moment-timezone");
const debug = require("debug")("app:reporting:timeseries");

const { HOURS_PER_DAY, DATE_KEY_FORMAT } = require("./constants");
const formatters = require("../formatters");
const {
  fetchElements,
  fetchHolidays,
  fetchEmployments,
  fetchProfiles,
  calcWeekdays
} = require("./helpers");

moment.locale("de");

/**
 * Calculates the timeseries data for the given timerange
 *
 *  - total
 *    - target time (#days * HOURS_PER_DAY * SCOPE - HOLIDAYS * SCOPE - VACATIONS * SCOPE - PLANNED * SCOPE)
 *    - actual time (HOLIDAYS * SCOPE + VACATIONS * SCOPE + PLANNED * SCOPE + RANGES + LOYALTY + QUALY + SPECIAL ABSENCES)
 *    - saldo time  (TARGET * -1 + ACTUAL)
 *  - data
 *    - [[date, actual, target, saldo]] or { date: { actual, actualFixed, target, saldo, scope }}
 *
 * @param {object}    models    loopback models
 * @param {object}    params    start, end, userId, flat, asMap, includeRaw, yearScope
 * @param {function}  callback  callback function
 */
const timeseriesReporting = (models, params, callback) => {
  debug(JSON.stringify(params));
  const {
    start,
    end,
    userId,
    flat,
    asMap,
    includeRaw = false,
    yearScope = false
  } = params;

  const startOfYear = start.clone().startOf("year");
  const endOfYear = end.clone().endOf("year");

  if (!start || !end || !userId)
    return callback(
      new Error("missing parameters (start, end, and userId are mandatory")
    );

  const trackFields = includeRaw
    ? ["date", "duration", "value"]
    : ["date", "duration"];

  const getElements = next => {
    fetchElements(
      models.element,
      {
        start,
        end,
        fields: ["id", "label", "unit"],
        type: { inq: ["static", "range"] },
        includeTracks: true,
        userId,
        trackFields
      },
      next
    );
  };

  const getHolidays = next => {
    fetchHolidays(
      models.holiday,
      {
        start: yearScope ? startOfYear : start,
        end: yearScope ? endOfYear : end,
        fields: ["date", "duration", "label", "value"]
      },
      next
    );
  };

  const getEmployments = next => {
    fetchEmployments(
      models.employment,
      {
        start: yearScope ? startOfYear : start,
        end: yearScope ? endOfYear : end,
        userId
      },
      next
    );
  };

  const getProfiles = next => {
    fetchProfiles(
      models["employment-profile"],
      {
        year: start.year(),
        userId
      },
      next
    );
  };

  return async.parallel(
    { getElements, getHolidays, getEmployments, getProfiles },
    (err, data) => {
      if (err) {
        return callback(err);
      }
      const {
        getElements: elements,
        getHolidays: holidays,
        getEmployments: employments,
        getProfiles: profiles
      } = data;

      const { dates } = calcWeekdays(
        {
          start: yearScope ? startOfYear : start,
          end: yearScope ? endOfYear : end
        },
        employments
      );

      const tracks = {};
      const today = moment();
      const report = {
        reportingPeriod: {
          type: "timeseries",
          start,
          end
        },
        total: {
          currentActual: 0, // sum of all tracks (inclusive holidays) from start to today (not the future and scoped)
          currentTarget: -1, // #workdays * hours_per_day * scope from start to today -1 hour for the Zwibelemärit
          currentSaldo: 0, // currentTarget * -1 + currentActual
          target: -1 // #workdays * hours_per_day * scope from start to end -1 hour for the Zwibelemärit
        }
      };

      if (asMap) {
        report.data = {};
      } else {
        report.data = [];
      }

      if (includeRaw) {
        report.raw = {};
      }

      // create the lookup table for the tracks (key is the date in the format YYYYMMDD)
      _.each(elements, element => {
        _.each(element.toJSON().tracks, track => {
          const key = moment(track.date).format(DATE_KEY_FORMAT);

          if (!tracks[key]) tracks[key] = [];

          tracks[key].push({
            label: element.label,
            duration: track.duration,
            unit: element.unit,
            value: track.value
          });
        });
      });

      // add the holidays to the lookup table (key is the date in the format YYYYMMDD)
      _.each(holidays, holiday => {
        // skip holidays if they fall onto a weekend day
        const dayOfWeek = moment(holiday.date).day();
        if (dayOfWeek === 0 || dayOfWeek === 6) return;

        const key = moment(holiday.date).format(DATE_KEY_FORMAT);
        if (!tracks[key]) tracks[key] = [];
        tracks[key].push({
          isHoliday: true,
          label: holiday.label,
          duration: holiday.duration,
          unit: "d",
          value: holiday.value
        });
      });

      // if the start date is the first day of the year then we add transferGrantedOvertime and transferOvertime to the actual time
      if (start.month() === 0 && start.date() === 1 && _.head(profiles)) {
        const profile = _.head(profiles);
        report.total.currentActual += profile.transferGrantedOvertime;
        report.total.currentActual += profile.transferOvertime;
      }

      _.each(dates, ({ date, scope }) => {
        const key = date.format(DATE_KEY_FORMAT);

        // calculate the daily actual time
        const dailyActual = formatters.asDecimal(
          formatters.secondsAsHours(
            _.reduce(
              tracks[key] || [],
              (sum, track) => {
                // apply the scope for the current day if the track is of the type day
                if (track.unit === "d") track.duration *= scope;

                // if the track is a holiday then subtract it from the total target times
                if (track.isHoliday) {
                  report.total.target = formatters.asDecimal(
                    report.total.target -
                      formatters.secondsAsHours(track.duration)
                  );

                  // ToDo verify!
                  // if (
                  //   date.isSameOrAfter(start) &&
                  //   date.isSameOrBefore(end) &&
                  //   date.isSameOrBefore(today)
                  // ) {
                  //   report.total.currentTarget = formatters.asDecimal(
                  //     report.total.currentTarget -
                  //       formatters.secondsAsHours(track.duration)
                  //   );
                  // }
                }

                if (includeRaw) {
                  if (!report.raw[key]) report.raw[key] = [];

                  if (track.label.startsWith("Von-Bis")) {
                    const existingRange = _.findIndex(
                      report.raw[key],
                      o => o.label === "Von-Bis"
                    );

                    if (existingRange > -1) {
                      report.raw[key][existingRange].duration += track.duration;
                      report.raw[key][
                        existingRange
                      ].value += `, ${track.value}`;
                    } else {
                      report.raw[key].push({
                        label: "Von-Bis",
                        duration: track.duration,
                        unit: track.unit,
                        value: track.value,
                        scope
                      });
                    }
                  } else {
                    report.raw[key].push({
                      label: track.label,
                      duration: track.duration,
                      unit: track.unit,
                      value: track.value,
                      scope
                    });
                  }
                }

                // in all cases we add the duration to the dailyActual time
                return sum + track.duration;
              },
              0
            )
          )
        );

        // calculate the daily actual fixed time
        const dailyActualFixed = formatters.asDecimalFixed(dailyActual);

        // calculate the daily target time
        const dailyTarget = formatters.asDecimal(
          date.isoWeekday() < 6 ? HOURS_PER_DAY * scope : 0
        );

        // calculate the daily saldo time
        const dailySaldo = formatters.asDecimal(dailyTarget * -1 + dailyActual);

        // if we are in the time range start-end and not in the future then we add the durations to the "current" time values
        if (
          date.isSameOrAfter(start) &&
          date.isSameOrBefore(end) &&
          date.isSameOrBefore(today)
        ) {
          report.total.currentActual = formatters.asDecimal(
            report.total.currentActual + dailyActual
          );
          report.total.currentTarget = formatters.asDecimal(
            report.total.currentTarget + dailyTarget
          );
          report.total.currentSaldo = formatters.asDecimal(
            report.total.currentTarget * -1 + report.total.currentActual
          );
        }

        // in all cases we add the dailyTarget to the total time
        report.total.target = formatters.asDecimal(
          report.total.target + dailyTarget
        );

        if (asMap) {
          report.data[key] = {
            dailyActual,
            dailyActualFixed,
            dailyTarget,
            dailySaldo,
            currentActual: report.total.currentActual,
            currentTarget: report.total.currentTarget,
            currentSaldo: report.total.currentSaldo,
            totalTarget: report.total.target,
            scope
          };
        } else {
          report.data.push([
            date.valueOf(),
            dailyActual,
            dailyActualFixed,
            dailyTarget,
            dailySaldo,
            report.total.currentActual,
            report.total.currentTarget,
            report.total.currentSaldo,
            report.total.target,
            scope
          ]);
        }
      });

      if (flat) {
        return callback(null, report.data);
      } else {
        return callback(null, report);
      }
    }
  );
};

module.exports = timeseriesReporting;
