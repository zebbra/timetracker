const _ = require("lodash");
const debug = require("debug")("app:reporting:helpers");
const moment = require("moment-timezone");

const {
  DATE_KEY_FORMAT,
  HOURS_PER_DAY,
  DAY_TO_HOURS_ELEMENTS,
  DAY_TO_HOURS_ELEMENTS_2025
} = require("./constants");
const formatters = require("../formatters");

moment.locale("de");

const fetchElements = (
  Element,
  { start, end, type, label, fields, includeTracks, userId, trackFields },
  callback
) => {
  const elementsQuery = {
    start: { lte: end },
    or: [{ end: null }, { end: { gte: start } }]
  };

  if (type) {
    elementsQuery.type = type;
  }

  if (label) {
    elementsQuery.label = label;
  }

  if (includeTracks) {
    const include = {
      relation: "tracks",
      scope: {
        where: {
          userId,
          and: [{ date: { gte: start } }, { date: { lte: end } }]
        }
      }
    };

    if (trackFields) {
      include.scope.fields = trackFields;
    }

    debug(
      `method=fetchElements user=${userId} query=${JSON.stringify(
        elementsQuery
      )} include tracks=true`
    );
    Element.find({ where: elementsQuery, fields, include }, callback);
  } else {
    debug(
      `method=fetchElements user=${userId} query=${JSON.stringify(
        elementsQuery
      )} include tracks=false`
    );
    Element.find({ where: elementsQuery, fields }, callback);
  }
};

const fetchProfiles = (Profile, { year, userId, and, fields }, callback) => {
  const where = {
    userId,
    year,
    and
  };

  debug(
    `method=fetchProfiles user=${userId} query=${JSON.stringify(
      where
    )} fields=${fields}`
  );
  if (fields) {
    Profile.find(where, fields, callback);
  } else {
    Profile.find({ where }, callback);
  }
};

const fetchSetpoints = (Setpoint, { year, userId, and, fields }, callback) => {
  const where = {
    userId,
    year,
    and
  };

  debug(
    `method=fetchSetpoints user=${userId} query=${JSON.stringify(
      where
    )} fields=${fields}`
  );
  if (fields) {
    Setpoint.find({ where, fields }, callback);
  } else {
    Setpoint.find({ where }, callback);
  }
};

const fetchHolidays = (Holiday, { start, end, fields }, callback) => {
  const where = {
    and: [{ date: { gte: start } }, { date: { lte: end } }]
  };

  debug(`method=fetchHolidays query=${JSON.stringify(where)} fields=${fields}`);
  if (fields) {
    Holiday.find({ where, fields }, callback);
  } else {
    Holiday.find({ where }, callback);
  }
};

const fetchEmployments = (Employment, { start, end, userId }, callback) => {
  const where = {
    start,
    end,
    userId
  };

  debug(`method=fetchEmployments query=${JSON.stringify(where)}`);
  Employment.intersections(null, start, end, userId, callback);
};

const workingDaysForSelectedYear = (range, year, customStart, customEnd) => {
  let { start, end } = range;
  let workingDays = 0;

  const startOfYear = moment()
    .year(year)
    .startOf("year");
  const endOfYear = moment()
    .year(year)
    .endOf("year");

  start = moment(start);
  if (start.isBefore(startOfYear)) {
    start = startOfYear;
  }
  if (customStart && start.isBefore(customStart)) {
    start = customStart;
  }

  if (end) {
    end = moment(end);
    if (end.isAfter(endOfYear)) {
      end = endOfYear;
    }
    if (customEnd && end.isAfter(customEnd)) {
      end = customEnd;
    }
  } else if (customEnd) {
    end = customEnd;
  } else {
    end = endOfYear;
  }

  if (start.isValid() && end.isValid()) {
    while (start.isSameOrBefore(end)) {
      if (start.isoWeekday() < 6) {
        workingDays += 1;
      }
      start.add(1, "day");
    }
  }

  return workingDays;
};

// Example for 25 days vacation, 261 working days, 86 * 50%, 175 * 40%
// totalVacationsDaily = 25 * 8.4 / 261 = 0.804 hours per day for 100%
// scoped50% = 0.804 * 86 * 0.5 = 34.572h
// scoped40% = 0.804 * 175 * 0.4 = 56.28h
// total = scoped50% + scoped40% = 90.852h

const calcEmploymentScopes = (employments, year, start, end) => {
  return _.map(employments, employment => {
    return {
      workingDays: workingDaysForSelectedYear(employment, year, start, end),
      scope: employment.scope / 100
    };
  });
};

const applyEmploymentScopes = (value, weekdays, scopes) => {
  const totalDaily = (value * HOURS_PER_DAY) / weekdays;
  return formatters.asDecimal(
    _.reduce(
      scopes,
      (sum, entry) => (sum += totalDaily * entry.workingDays * entry.scope),
      0
    )
  );
};

const calcWeekdays = (range, employments) => {
  let { start, end } = range;
  const result = {
    days: 0,
    dates: [],
    weekdays: 0,
    weekdates: [],
    lookup: {}
  };

  if (moment(start).isValid() && moment(end).isValid()) {
    start = moment(start);
    end = moment(end);

    while (start.isSameOrBefore(end)) {
      const key = start.format(DATE_KEY_FORMAT);
      const scope = employmentLookup(employments, start);
      result.lookup[key] = scope;

      result.dates.push({ date: start.clone(), scope });
      if (start.isoWeekday() < 6) {
        result.weekdates.push({ date: start.clone(), scope });
      }

      start.add(1, "day");
    }
  }

  result.days = result.dates.length;
  result.weekdays = result.weekdates.length;
  return result;
};

const employmentLookup = (employments, date) => {
  let scope = 0;

  if (employments && employments.length > 0) {
    _.each(employments, employment => {
      if (employment.end) {
        if (
          date.isSameOrAfter(employment.start) &&
          date.isSameOrBefore(employment.end)
        ) {
          scope = employment.scope;
          return false;
        }
      } else if (date.isSameOrAfter(employment.start)) {
        scope = employment.scope;
        return false;
      }
      return true;
    });
  }

  if (scope !== 0) scope /= 100;

  return scope;
};

function getHouerlyElements(year) {
  return year > 2024 ? DAY_TO_HOURS_ELEMENTS_2025 : DAY_TO_HOURS_ELEMENTS;
}

module.exports = {
  fetchElements,
  fetchProfiles,
  fetchSetpoints,
  fetchHolidays,
  fetchEmployments,
  workingDaysForSelectedYear,
  calcEmploymentScopes,
  applyEmploymentScopes,
  calcWeekdays,
  employmentLookup,
  getHouerlyElements
};
