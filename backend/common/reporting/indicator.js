const _ = require("lodash");
const async = require("async");
const moment = require("moment-timezone");
const debug = require("debug")("app:reporting:indicator");

const {
  LABEL_TO_PROFILE_LOOKUP,
  HOURS_PER_DAY,
  DATE_KEY_FORMAT
} = require("./constants");
const formatters = require("../formatters");
const {
  fetchElements,
  fetchProfiles,
  fetchEmployments,
  calcEmploymentScopes,
  applyEmploymentScopes,
  employmentLookup,
  getHouerlyElements
} = require("./helpers");

moment.locale("de");

/**
 * Calculates the following indicators for the given timerange whereas start and end dates
 * must be in the same year:
 *
 *  - special absences
 *    - (total, target, saldo)
 *  - qualy
 *    - (total, target, saldo)
 *  - vacations     (PLANNED + LAST YEAR, scoped)
 *    - (total, target, saldo)
 *  - mixed         (scoped)
 *    - (total, target, saldo)
 *  - loyalty
 *    - (total, target, saldo)
 *
 * If enhanced is set to true we will calculate the actual values in hours base on the different
 * employments for the properties listed above
 *
 * @param {object}    models    loopback models
 * @param {object}    params    start, end, userId, flat, enhanced, includeRaw
 * @param {function}  callback  callback function
 */
const indicatorReporting = (models, params, callback) => {
  debug(JSON.stringify(params));
  const {
    start,
    end,
    userId,
    flat,
    enhanced = false,
    includeRaw = false
  } = params;

  if (!start || !end || !userId)
    return callback(
      new Error("missing parameters (start, end, and userId are mandatory")
    );

  if (!start.isSame(end, "year"))
    return callback(new Error("invalid range (multiple years)"));

  const trackFields = enhanced ? ["date", "value"] : ["value"];

  const getElements = next => {
    fetchElements(
      models.element,
      {
        start,
        end,
        fields: ["id", "unit", "label"],
        type: "static",
        includeTracks: true,
        userId,
        trackFields
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

  const getEmployments = next => {
    if (enhanced) {
      fetchEmployments(
        models.employment,
        {
          start: start.clone().startOf("year"),
          end: end.clone().endOf("year"),
          userId
        },
        next
      );
    } else {
      next();
    }
  };

  return async.parallel(
    { getElements, getProfiles, getEmployments },
    (err, data) => {
      if (err) {
        return callback(err);
      }
      const {
        getElements: elements,
        getProfiles: profiles,
        getEmployments: employments
      } = data;
      const profile = (_.head(profiles) && _.head(profiles).toJSON()) || {
        transferGrantedVacations: 0
      };
      const plannedProfile = {
        plannedVacations: 0,
        plannedMixed: 0,
        plannedQuali: 0,
        plannedPremiums: 0,
        plannedSpecialAbsences: 0,
        plannedIllness: 0
      };
      _.extend(plannedProfile, profile);

      const report = {
        reportingPeriod: {
          type: "indicators",
          start,
          end
        },
        data: []
      };

      if (includeRaw) {
        report.raw = {};
      }

      if (enhanced) {
        // calculate days to hours
        _enhancePlannedProfile(plannedProfile, employments, start, end);
      }

      report.data = _.chain(elements)
        // only take elements defined in this constant
        .filter(element => LABEL_TO_PROFILE_LOOKUP[element.label])
        .map(entry => {
          const element = entry.toJSON();

          const actual = formatters.asDecimal(
            _.reduce(
              element.tracks,
              (sum, track) => {
                if (includeRaw && (!enhanced || element.unit !== "d")) {
                  const key = moment(track.date).format(DATE_KEY_FORMAT);

                  if (!report.raw[key]) report.raw[key] = [];

                  report.raw[key].push({
                    label: element.label,
                    duration: enhanced
                      ? formatters.hoursAsSeconds(track.value)
                      : undefined, // eslint-disable-line no-undefined
                    unit: element.unit,
                    value: track.value
                  });
                }

                return sum + track.value;
              },
              0
            )
          );

          let target =
            plannedProfile[LABEL_TO_PROFILE_LOOKUP[element.label]] || 0;

          if (element.label === "Ferien") {
            // add the transferred granted vacations to target vacations
            target += plannedProfile.transferGrantedVacations;

            element.transferGrantedVacations =
              plannedProfile.transferGrantedVacations;
            element.transferGrantedVacationsHours = formatters.asDecimal(
              plannedProfile.transferGrantedVacationsHours
            );
          }

          const { actualHours, targetHours } = _calcEnhancedValues(
            element,
            enhanced,
            employments,
            actual,
            plannedProfile,
            includeRaw,
            report
          );

          let saldo = 0;
          if (
            _.includes(["Besondere Abwesenheiten", "Krankheit"], element.label)
          ) {
            saldo = formatters.asDecimal(target + actual);
          } else {
            saldo = formatters.asDecimal(target - actual);
          }

          Object.assign(element, {
            actual,
            actualFixed: formatters.asDecimalFixed(actual),
            target,
            saldo
          });
          if (enhanced) {
            element.actualHours = formatters.asDecimal(actualHours);
            element.targetHours = formatters.asDecimal(targetHours);
          }
          delete element.tracks;
          return element;
        })
        .value();

      if (flat) {
        return callback(null, report.data);
      } else {
        return callback(null, report);
      }
    }
  );
};

function _enhancePlannedProfile(profile, employments, start, end) {
  const employmentScopesForYear = calcEmploymentScopes(
    employments,
    start.year(),
    start.clone().startOf("year"),
    end.clone().endOf("year")
  );

  const weekdays = _.sum(_.map(employmentScopesForYear, "workingDays"));

  getHouerlyElements(start.year()).forEach(key => {
    profile[`${key}Hours`] = applyEmploymentScopes(
      profile[key],
      weekdays,
      employmentScopesForYear
    );
  });
}

function _calcEnhancedValues(
  element,
  enhanced,
  employments,
  actual,
  profile,
  includeRaw,
  report
) {
  let actualHours, targetHours;

  if (enhanced) {
    if (element.unit === "d") {
      actualHours = _.reduce(
        element.tracks,
        (sum, track) => {
          const scope = employmentLookup(employments, moment(track.date));
          const hours = track.value * HOURS_PER_DAY * scope;

          if (includeRaw) {
            const key = moment(track.date).format(DATE_KEY_FORMAT);

            if (!report.raw[key]) report.raw[key] = [];

            report.raw[key].push({
              label: element.label,
              duration: enhanced ? formatters.hoursAsSeconds(hours) : undefined, // eslint-disable-line no-undefined
              unit: element.unit,
              value: track.value,
              scope
            });
          }

          return sum + hours;
        },
        0
      );
    } else {
      actualHours = actual;
    }

    targetHours =
      profile[`${LABEL_TO_PROFILE_LOOKUP[element.label]}Hours`] ||
      profile[`${LABEL_TO_PROFILE_LOOKUP[element.label]}`] ||
      0;
  }

  return {
    actualHours,
    targetHours
  };
}

module.exports = indicatorReporting;
