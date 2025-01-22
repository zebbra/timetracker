import moment from 'moment-timezone';

export const EMAIL_REGEX = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;
export const ALPHA_REGEX = /^[a-z]+$/i;
export const ALPHA_NUMERIC_REGEX = /^[a-z0-9]+$/i;
export const NON_ALPHA_NUMERIC_REGEX = /[^a-z0-9]/ig;
export const ALPHA_NUMERIC_EXTENDED_REGEX = /^[a-z0-9\-_\s.()/]+$/i;
export const NAME_REGEX = /^([ \u00c0-\u01ffa-zA-Z'-/])+$/;
export const PASSWORD_REGEX = /^((?=.*[a-z])(?=.*[0-9]))(?=.{8,})/;
export const FACTOR_REGEX = /^\d{1}\.\d{2}$/;
export const TWO_DECIMALS = /^-?\d+(\.\d{1,2})?$/;
export const VALID_EMAIL_DOMAINS = ['@medi.ch', '@zebbra.ch'];
export const MAX_TEXT_FIELD_LENGTH = 255;


export const PERCENT = /^[1-9][0-9]?$|^0$|^100$/;
export const DECIMAL = /^\d+\.\d+$/;
export const DAY_REGEX = /^1$|^0(?:[.,]\d+)?$/;                                     // 0..1
export const HOUR_REGEX = /^(?:2[0-3]|1[0-9]|0?[1-9])(?:[,.:]\d+)*$|^0[,.:]\d+$/;   // (0)1-23([,.:]...)
export const LESSION_REGEX = /^(?:2[0-3]|1[0-9]|0?[1-9])(?:[,.]\d+)*$|^0[,.]\d+$/;  // (0)1-23([,.]...)
export const RANGE_REGEX = /^(-?(?:2[0-3]|[01][0-9]):[0-5][0-9]){2}$/;              // [00:00-23:59]-[00:00-23:59]

const EMAIL_WHITELIST = [
  'krebarb@gmail.com',
];

/**
 * Validates the min character length of a given form value
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form attribute to validate
 * @param {number}        min         The min length of the attribute
 */
export function minLength(values, attribute, min) {
  const errors = {};

  if (values.get(attribute)) {
    if (min && values.get(attribute).length < min) {
      errors[attribute] = `Mindestens ${min} Zeichen benötigt`;
    }
  }

  return errors;
}

/**
 * Validates the max character length of a given form value
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {number}        max         The max length of the attribute
 */
export function maxLength(values, attribute, max) {
  const errors = {};

  if (values.get(attribute)) {
    if (max && values.get(attribute).length > max) {
      errors[attribute] = `Maximal ${max} Zeichen erlaubt`;
    }
  }

  return errors;
}

/**
 * Validates if all fields passed in the `requriedFields` array are filled in
 *
 * @param {immutable map} values          The form values
 * @param {array}         requiredFields  An array of form fields to be validated for required
 */
export function required(values, requiredFields) {
  const errors = {};

  requiredFields.forEach((field) => {
    if (!values.get(field)) {
      errors[field] = 'Wird benötigt';
    }
  });

  return errors;
}

/**
 * Validates if the form field value containes only characters /^[a-z]+$/i
 * and value character lengt as well if `min` or `max` parameters are given
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {number}        min         The min length for the form field (optional)
 * @param {number}        max         The max length for the form field (optional)
 */
export function alphaString(values, attribute, min, max) {
  const errors = {};

  Object.assign(errors, minLength(values, attribute, min));
  Object.assign(errors, maxLength(values, attribute, max));
  if (values.get(attribute)) {
    if (!ALPHA_REGEX.test(values.get(attribute))) {
      errors[attribute] = 'Nur Buchstaben erlaubt';
    }
  }

  return errors;
}

/**
 * Validates if the form field value containes only characters /^[a-z0-9]+$/i
 * and value character lengt as well if `min` or `max` parameters are given
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {number}        min         The min length for the form field (optional)
 * @param {number}        max         The max length for the form field (optional)
 */
export function alphaNumericString(values, attribute, min, max) {
  const errors = {};

  Object.assign(errors, minLength(values, attribute, min));
  Object.assign(errors, maxLength(values, attribute, max));
  if (values.get(attribute)) {
    if (!ALPHA_NUMERIC_REGEX.test(values.get(attribute))) {
      errors[attribute] = 'Nur Buchstaben und Zahlen erlaubt';
    }
  }

  return errors;
}

/**
 * Validates if the form field value containes only characters /^[a-z0-9\-_\s]+$/i
 * and value character lengt as well if `min` or `max` parameters are given
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {number}        min         The min length for the form field (optional)
 * @param {number}        max         The max length for the form field (optional)
 */
export function alphaNumericExtendedString(values, attribute, min, max) {
  const errors = {};

  Object.assign(errors, minLength(values, attribute, min));
  Object.assign(errors, maxLength(values, attribute, max));
  if (values.get(attribute)) {
    if (!ALPHA_NUMERIC_EXTENDED_REGEX.test(values.get(attribute))) {
      errors[attribute] = 'Nur Buchstaben, Zahlen, Leerzeichen und Bindestrich erlaubt';
    }
  }

  return errors;
}

/**
 * Validates if the form field value containes only characters /^([ \u00c0-\u01ffa-zA-Z'-])+$/
 * and value character lengt as well if `min` or `max` parameters are given
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {number}        min         The min length for the form field (optional)
 * @param {number}        max         The max length for the form field (optional)
 */
export function nameRegexString(values, attribute, min, max) {
  const errors = {};

  Object.assign(errors, minLength(values, attribute, min));
  Object.assign(errors, maxLength(values, attribute, max));
  if (values.get(attribute)) {
    if (!NAME_REGEX.test(values.get(attribute))) {
      errors[attribute] = 'Enthält ungültige Zeichen';
    }
  }

  return errors;
}

/**
 * Validates if the form field value containes only characters /^[1-9][0-9]?$|^0$|^100$/
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 */
export function percentNumber(values, attribute) {
  const errors = {};

  if (values.get(attribute)) {
    if (!PERCENT.test(values.get(attribute))) {
      errors[attribute] = 'Nur Zahlen zwischen 0 und 100 erlaubt';
    }
  }

  return errors;
}

/**
 * Validates if the form field value containes only characters /^\d+(\.\d{1,2})?$/
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 */
export function twoDecimalsNumber(values, attribute, inverse) {
  const errors = {};

  if (values.get(attribute)) {
    if (!TWO_DECIMALS.test(values.get(attribute))) {
      errors[attribute] = 'Nur Zahlen mit bis zu zwei Dezimalstellen erlaubt';
    }
  }

  if (inverse) {
    return Object.keys(errors).length > 0;
  }
  return errors;
}

/**
 * Validates if the form field value containes a valid email address
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 */
export function email(values, attribute) {
  const errors = {};

  if (values.get(attribute)) {
    if (!EMAIL_REGEX.test(values.get(attribute))) {
      errors[attribute] = 'Ungültige Email-Adresse';
    } else {
      let valid = EMAIL_WHITELIST.includes(values.get(attribute));
      VALID_EMAIL_DOMAINS.forEach((domain) => {
        if (new RegExp(domain).test(values.get(attribute))) {
          valid = true;
        }
      });
      if (!valid) {
        errors[attribute] = 'Unügltige Email-Domain';
      }
    }
  }

  return errors;
}

/**
 * Validates if a form field value contains only MAX_TEXT_FIELD_LENGTH number of characters
 *
 * @param {immutable map}   values      The form values
 * @param {string}          attribute   The form field to validate
 * @param {boolean}         inverse     Return true if there was an error otherwise false
 */
export function textField(values, attribute, inverse) {
  const errors = {};

  if (values.get(attribute)) {
    if (values.get(attribute).length > MAX_TEXT_FIELD_LENGTH) {
      errors[attribute] = `Darf nicht mehr als ${MAX_TEXT_FIELD_LENGTH} Zeichen enthalten`;
    }
  }

  if (inverse) {
    return Object.keys(errors).length > 0;
  }

  return errors;
}

/**
 * Validates if the `to date` is after the `start date` and vise-versa
 *
 * @param {immutable map}   values    The form values
 * @param {date}            from      The from value of the form
 * @param {date}            to        The to value of the form
 */
export function dateBeforeAndAfter(values, from, to) {
  const errors = {};

  if (values.get(from) && values.get(to)) {
    if (moment(values.get(from)).isAfter(moment(values.get(to)))) {
      errors._error = 'Startdatum muss vor Enddatum sein';
    }
  }

  return errors;
}

/**
 * Validates if the `to date` and the `start date` are in the same year
 *
 * @param {immutable map}   values    The form values
 * @param {date}            from      The from value of the form
 * @param {date}            to        The to value of the form
 */
export function dateSameYear(values, from, to) {
  const errors = {};

  if (values.get(from) && values.get(to)) {
    if (!moment(values.get(from)).isSame(moment(values.get(to)), 'year')) {
      errors._error = 'Startdatum und Enddatum müssen im gleichen Jahr sein';
    }
  }

  return errors;
}

/**
 * Validates if the form field value containes only characters /^1$|^0(?:[.,]\d+)?$/
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {bool}          flat        If true returns a string as error instead of an object
 */
export const validateDays = (values, attribute, flat) => {
  let errors = null;

  if (values.get(attribute)) {
    if (!DAY_REGEX.test(values.get(attribute))) {
      if (flat) {
        errors = 'Nur Werte zwischen 0 und 1 erlaubt';
      } else {
        if (!errors) {
          errors = {};
        }
        errors[attribute] = 'Nur Werte zwischen 0 und 1 erlaubt';
      }
    }
  }

  return errors;
};

/**
 * Validates if the form field value containes only characters /^(?:2[0-3]|1[0-9]|0?[1-9])(?:[,.:]\d+)*$|^0[,.:]\d+$/
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {bool}          flat        If true returns a string as error instead of an object
 */
export const validateHours = (values, attribute, flat) => {
  let errors = null;

  if (values.get(attribute)) {
    if (!HOUR_REGEX.test(values.get(attribute))) {
      if (flat) {
        errors = 'Nur Werte zwischen (0)1-24 erlaubt';
      } else {
        if (!errors) {
          errors = {};
        }
        errors[attribute] = 'Nur Werte zwischen (0)1-24 erlaubt';
      }
    }
  }

  return errors;
};

/**
 * Validates if the form field value containes only characters /^(?:2[0-3]|1[0-9]|0?[1-9])(?:[,.]\d+)*$|^0[,.]\d+$/
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {bool}          flat        If true returns a string as error instead of an object
 */
export const validateLessions = (values, attribute, flat) => {
  let errors = null;

  if (values.get(attribute)) {
    if (!LESSION_REGEX.test(values.get(attribute))) {
      if (flat) {
        errors = 'Nur Werte zwischen (0)1-24 erlaubt';
      } else {
        if (!errors) {
          errors = {};
        }
        errors[attribute] = 'Nur Werte zwischen (0)1-24 erlaubt';
      }
    }
  }

  return errors;
};

/**
 * Validates if the form field value containes only valid numbers
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {bool}          flat        If true returns a string as error instead of an object
 */
export const validateNumber = (values, attribute, flat) => {
  let errors = null;

  if (values.get(attribute)) {
    if (isNaN(values.get(attribute))) {
      if (flat) {
        errors = 'Nur Zahlen erlaubt';
      } else {
        if (!errors) {
          errors = {};
        }
        errors[attribute] = 'Nur Zahlen erlaubt';
      }
    }
  }

  return errors;
};

/**
 * Validates if the form field value containes only characters /^(-?(?:2[0-3]|[01][0-9]):[0-5][0-9]){2}$/
 * which is `[00:00-23:59]-[00:00-23:59]`
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {bool}          flat        If true returns a string as error instead of an object
 * @param {array}         slots       Currently occupied time range slots for this element on this day
 */
export const validateRange = (values, attribute, flat, slots) => {
  let errors = null;

  const setError = (message) => {
    if (flat) {
      errors = message;
    } else {
      if (!errors) {
        errors = {};
      }
      errors[attribute] = message;
    }
  };

  const valueToRange = (value) => {
    let from;
    let to;
    let error;

    if (typeof value !== 'string') {
      error = `Es gab einen Fehler bei der Validierung des Wertes: ${JSON.stringify(value)}`;
    } else {
      [from, to] = value.split('-');
      from = moment(from, 'hh:mm');
      to = moment(to, 'hh:mm');
    }

    return { from, to, error };
  };

  if (values.get(attribute)) {
    if (!RANGE_REGEX.test(values.get(attribute))) {
      setError('Nur [00:00-23:59]-[00:00-23:59] als Wert erlaubt');
    } else {
      const { from, to, error } = valueToRange(values.get(attribute));

      if (error) {
        setError(error);
      } else if (from.diff(to) > 0) {
        setError('Bis darf nicht vor Von sein');
      } else if (slots) {
        slots.forEach((slot) => {
          const slotRange = valueToRange(slot);
          if (from.isSameOrBefore(slotRange.to) && slotRange.from.isSameOrBefore(to)) {
            setError('Zeitintervalle überlappen');
          }
        });
      }
    }
  }

  return errors;
};

/**
 * Validates if the form field value containes a valid text input
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 * @param {bool}          flat        If true returns a string as error instead of an object
 */
export const validateText = (values, attribute, flat) => {
  let errors = null;

  if (values.get(attribute)) {
    if (values.get(attribute).length >= 255) {
      if (flat) {
        errors = 'Maximal 255 Zeichen erlaubt';
      } else {
        if (!errors) {
          errors = {};
        }
        errors[attribute] = 'Maximal 255 Zeichen erlaubt';
      }
    }
  }

  return errors;
};

/**
 * Validates if the given date is not in the `closed time range`. The
 * date is considered as closed when it is the previous (or further away) year
 * and the the current month is not January or February
 *
 * @param {immutable map} values      The form values
 * @param {string}        attribute   The form field to validate
 */
export function notInClosedRange(values, attribute) {
  const errors = {};

  if (values.get(attribute)) {
    const today = moment();
    const target = moment(values.get(attribute));

    if (target.year() < today.year()) {
      if (today.month() > 1) {
        errors[attribute] = 'Ist ungültig (geschlossen)';
      } else if (target.year() !== today.year() - 1) {
        errors[attribute] = 'Ist ungültig (geschlossen)';
      }
    }
  }

  return errors;
}

/**
 * Validates if the given date is in the `closed time range`. The
 * date is considered as closed when it is the previous (or further away) year
 * and the the current month is not January or February
 *
 * @param {date}        date   The date to validate
 */
export function isClosedDate(date) {
  let closed = false;
  const today = moment();
  const target = moment(date);

  if (target.year() < today.year()) {
    if (today.month() > 1) {
      closed = true;
    } else if (target.year() !== today.year() - 1) {
      closed = true;
    }
  }

  return closed;
}

/**
 * Validates if the given year is in the `closed time range`. The
 * date is considered as closed when it is the previous (or further away) year
 * and the the current month is not January or February
 *
 * @param {year}        number   The date to validate
 */
export function isClosedYear(year) {
  let closed = false;

  if (year < moment().year()) {
    // january or february --> test for closed date
    if (moment().month() < 2 && year === moment().year() - 1) {
      closed = false;
    } else {
      closed = true;
    }
  }

  return closed;
}
