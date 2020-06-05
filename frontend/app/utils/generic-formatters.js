import moment from 'moment';

/**
 * Formats a string value as date
 *
 * @param {date}    value     The value to parse to a date
 * @param {string}  format    The format to apply to the date (optional)
 */
export function asDate(value, format) {
  let result = '';

  if (value) {
    if (moment(new Date(value)).isValid()) {
      if (format) {
        result = moment(new Date(value).format(format));
      } else {
        result = moment(new Date(value)).format('DD.MM.YYYY');
      }
    } else {
      result = value;
    }
  }

  return result;
}

/**
 * Unit lookup
 *
 * @param {string}  unit    The unit to lookup
 */
export function prettyUnit(unit) {
  const lookup = {
    l: 'Lektionen',
    h: 'Stunden',
  };

  return lookup[unit] || unit;
}
