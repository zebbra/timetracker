const moment = require("moment-timezone");
const errors = require("./errors");

const DAY_REGEX = /^1$|^0(?:[.,]\d+)?$/; // 0..1
const HOUR_REGEX = /^(?:2[0-3]|1[0-9]|0?[1-9])(?:[,.]\d+)*$|^0[,.]\d+$/; // (0)1-23([,.:]...)
const LESSION_REGEX = /^(?:2[0-3]|1[0-9]|0?[1-9])(?:[,.]\d+)*$|^0[,.]\d+$/; // (0)1-23([,.]...)
const RANGE_REGEX = /^(-?(?:2[0-3]|[01][0-9]):[0-5][0-9]){2}$/; // [00:00-23:59]-[00:00-23:59]
const WEEK_REGEX = /^\d+(?:[,.]\d+)?$/;
const TWO_DECIMALS = /^-?\d+(\.\d{1,2})?$/;
const PERCENT = /^[1-9][0-9]?$|^0$|^100$/;
const VALID_EMAIL_DOMAINS = /^.*@zebbra\.ch|.*@medi\.ch|krebarb@gmail.com$/;

/**
 * Generic regex
 */
module.exports.ALPHA_NUMERIC_REGEX = /^[a-z0-9]+$/i;
module.exports.NON_ALPHA_NUMERIC_REGEX = /[^a-z0-9]/gi;
module.exports.ALPHA_NUMERIC_EXTENDED_REGEX = /^[a-z0-9\-_\s.()]+$/i;
module.exports.NAME_REGEX = /^([ \u00c0-\u01ffa-zA-Z'-/])+$/;
module.exports.EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;
module.exports.PASSWORD_REGEX = /^((?=.*[a-z])(?=.*[0-9]))(?=.{8,})/;
module.exports.FACTOR_REGEX = /^\d+(\.\d{1,2})?$/;
module.exports.TWO_DECIMALS = TWO_DECIMALS;
module.exports.PERCENT = PERCENT;
module.exports.VALID_EMAIL_DOMAINS = VALID_EMAIL_DOMAINS;

/**
 * Validate the values based on the track unit
 */
module.exports.validateDays = value => DAY_REGEX.test(value);
module.exports.validateHours = value => HOUR_REGEX.test(value);
module.exports.validateRanges = value => RANGE_REGEX.test(value);
module.exports.validateLessions = value => LESSION_REGEX.test(value);
module.exports.validateHoursNumber = value => !isNaN(value);
module.exports.validateWeeks = value => WEEK_REGEX.test(value);
module.exports.validateText = value => {
  if (value) {
    return value.toString().length < 255;
  }
  return true;
};
module.exports.validateByUnit = (unit, value) => {
  switch (unit) {
    case "d":
      return module.exports.validateDays(value);
    case "h":
      return module.exports.validateHours(value);
    case "r":
      return module.exports.validateRanges(value);
    case "l":
      return module.exports.validateLessions(value);
    case "n":
      return module.exports.validateHoursNumber(value);
    case "w":
      return module.exports.validateWeeks(value);
    case "t":
      return module.exports.validateText(value);
    default:
      return false;
  }
};

/**
 * Validates if the form field value containes only characters /^\d+(\.\d{1,2})?$/
 */
module.exports.twoDecimalsNumber = value => TWO_DECIMALS.test(value);

/**
 * Password validation
 */
module.exports.validatePassword = (passwordPlain, passwordProperties) => {
  const codes = { password: [] };
  const messages = { password: [] };

  let hasError = false;
  if (passwordProperties.max && passwordPlain.length > passwordProperties.max) {
    codes.password.push("length.max");
    messages.password.push("too long");
    hasError = true;
  } else if (
    passwordProperties.min &&
    passwordPlain.length < passwordProperties.min
  ) {
    codes.password.push("length.min");
    messages.password.push("too short");
    hasError = true;
  }

  if (!module.exports.PASSWORD_REGEX.test(passwordPlain)) {
    codes.password.push("format");
    messages.password.push("is invalid");
    hasError = true;
  }

  if (hasError) {
    throw errors.customValidationError("user", codes, messages);
  }
};

/**
 * Make sure that one cannot generate this ressource for the past year(s) (after Janaury or February of the following year)
 */
module.exports.isClosedDate = value => {
  const today = moment();
  const target = moment(value);
  let closed = false;

  if (target.year() > today.year()) {
    closed = false;
  } else if (today.month() < 2) {
    // January or February --> one can modify this or the previous year
    closed =
      !today.isSame(target, "year") &&
      !today.subtract(1, "year").isSame(target, "year");
  } else {
    // after January --> one can only modify this year
    closed = !today.isSame(target, "year");
  }

  return closed;
};

/**
 * Make sure that one cannot generate this ressource for the past year(s) (after Janaury or February of the following year)
 */
module.exports.isClosedYear = year => {
  const today = moment();
  let closed = false;

  if (year > today.year()) {
    closed = false;
  } else if (today.month() < 2) {
    // January --> one can modify this or the previous year
    closed = today.year() !== year && today.subtract(1, "year").year() !== year;
  } else {
    // after January --> one can only modify this year and coming years
    closed = today.year() > year;
  }

  return closed;
};

/**
 * Make suer that the given start date is before the given end date
 */
module.exports.startBeforeEnd = (start, end) => {
  if (end) {
    return moment(start).isBefore(moment(end));
  }
  return true;
};

/**
 * Make sure that the filter of the passed type contains the required attributes
 */
module.exports.requiresFilter = (filter, type, attributes) => {
  let error = "";

  if (!filter) {
    error += "no filter provided";
  } else if (!filter[type]) {
    error += `no ${type} filter provied`;
  } else {
    attributes.forEach(attribute => {
      if (!filter[type][attribute]) {
        error += `${attribute} is mandatory for ${type} filter`;
      }
    });
  }

  if (error !== "") {
    return new Error(error);
  }
  return null;
};

/**
 * Make sure that the passed dates are of a valid ate format
 */
module.exports.validDates = (data, attributes) => {
  let error = "";

  attributes.forEach(attribute => {
    if (!moment(data[attribute]).isValid()) {
      error += `${attribute} is not a valid date`;
    }
  });

  if (error !== "") {
    return new Error(error);
  }
  return null;
};
