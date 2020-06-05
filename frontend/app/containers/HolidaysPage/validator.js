import { notInClosedRange, alphaNumericExtendedString, validateDays, required } from 'utils/generic-validators';

function validate(values) {
  const errors = {};
  const requiredFields = ['label', 'date', 'value'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, alphaNumericExtendedString(values, 'label', 3, 32));
  Object.assign(errors, validateDays(values, 'value'));
  Object.assign(errors, notInClosedRange(values, 'date'));

  return errors;
}

export default validate;
