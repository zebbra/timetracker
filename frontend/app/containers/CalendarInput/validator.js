import { validateDays, validateHours, validateLessions, validateRange, validateNumber, validateText } from 'utils/generic-validators';

export const validate = (type, slots) => {
  switch (type) {
    case 'd': return (unused, values) => validateDays(values, 'value', true);
    case 'h': return (unused, values) => validateHours(values, 'value', true);
    case 'l': return (unused, values) => validateLessions(values, 'value', true);
    case 'r': return (unused, values) => validateRange(values, 'value', true, slots);
    case 'n': return (unused, values) => validateNumber(values, 'value', true);
    case 't': return (unused, values) => validateText(values, 'value', true);
    default: return null;
  }
};

export default validate;
