const moment = require("moment-timezone");
const validators = require("./validators");

const SECONDS_PER_WEEK = 60 * 60 * 8.4 * 5;
const SECONDS_PER_DAY = 60 * 60 * 8.4;

module.exports.durationFromDays = value => {
  if (validators.validateDays(value)) {
    return Number(value) * SECONDS_PER_DAY;
  }
  return 0;
};

module.exports.durationFromHours = value => {
  if (validators.validateHoursNumber(value)) {
    return moment.duration(Number(value), "h").asSeconds();
  }
  return 0;
};

module.exports.durationFromRanges = value => {
  if (validators.validateRanges(value)) {
    const duration = moment
      .duration(
        moment(value.split("-")[1], "hh:mm").diff(
          moment(value.split("-")[0], "hh:mm")
        )
      )
      .asSeconds();
    if (duration < 0) {
      return 0;
    }
    return duration;
  }
  return 0;
};

module.exports.durationFromLessions = (value, factor) => {
  if (!factor) {
    factor = 1;
  }

  if (validators.validateLessions(value)) {
    return (
      Math.round(
        moment.duration(Number(value) * factor, "h").asSeconds() * 100
      ) / 100
    );
  }
  return 0;
};

module.exports.durationFromWeeks = value => {
  if (validators.validateWeeks(value)) {
    return value * SECONDS_PER_WEEK;
  }
  return 0;
};

module.exports.durationByUnit = (unit, value, factor) => {
  switch (unit) {
    case "d":
      return module.exports.durationFromDays(value);
    case "h":
      return module.exports.durationFromHours(value);
    case "r":
      return module.exports.durationFromRanges(value);
    case "l":
      return module.exports.durationFromLessions(value, factor);
    case "n":
      return module.exports.durationFromHours(value);
    case "w":
      return module.exports.durationFromWeeks(value);
    default:
      return 0;
  }
};
