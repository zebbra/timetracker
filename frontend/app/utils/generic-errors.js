/**
 * Takes the form data and maps the backend validation error codes to the
 * form fields.
 *
 * @param {string}  field           The name of the form field
 * @param {object}  fieldMapping    The mapping object
 * @param {code}    code            The backend form validation error code
 */
export const validationCodesMapping = (field, fieldMapping, code) => {
  let name = 'Das Feld';
  if (fieldMapping[field]) name = fieldMapping[field];

  const lookup = {
    'custom.email': `${name} ist ungültig`,
    'format.blank': `${name} darf nicht leer sein`,
    format: `${name} ist unültig`,
    'length.blank': `${name} darf nicht leer sein`,
    'length.min': `${name} ist zu kurz`,
    'length.max': `${name} ist zu lang`,
    presence: `${name} darf nicht leer sein`,
    uniqueness: `${name} ist bereits vergeben`,
    missing: `${name} darf nicht leer sein`,
    invalid: `${name} ist ungültig`,
  };

  return lookup[code] || code;
};

/**
 * Parse the backend validation error to custom messages.
 *
 * @param {error}   error           Backend validation error to parse
 * @param {string}  globalError     Global form error to display at top of form if there is one given
 * @param {object}  fieldMapping    Map to map the codes and messages in the error detail fields
 */
export function validationErrors(error, globalError, fieldMapping) {
  const errors = {
    _error: globalError,
  };

  if (error.details && error.details.codes) {
    Object.keys(error.details.codes).forEach((field) => {
      if (!errors[field]) errors[field] = [];
      if (!Array.isArray(errors[field])) errors[field] = [errors[field]];

      error.details.codes[field].forEach((code) => {
        const mappedError = validationCodesMapping(field, fieldMapping, code);
        if (errors[field].indexOf(mappedError) === -1) {
          errors[field].push(mappedError);
        }
      });

      errors[field] = errors[field].join('. ');
    });
  }

  return errors;
}
