import { alphaNumericExtendedString, nameRegexString, required, email } from 'utils/generic-validators';

function validate(values) {
  const errors = {};
  const requiredFields = ['username', 'email', 'firstName', 'lastName'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, alphaNumericExtendedString(values, 'username', 3, 15));
  Object.assign(errors, email(values, 'email'));
  Object.assign(errors, nameRegexString(values, 'firstName', 3, 50));
  Object.assign(errors, nameRegexString(values, 'lastName', 3, 50));

  return errors;
}

export default validate;
