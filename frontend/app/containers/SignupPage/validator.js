import { required, alphaNumericExtendedString, email, nameRegexString, PASSWORD_REGEX } from 'utils/generic-validators';

function validate(values) {
  const errors = {};
  const requiredFields = ['username', 'email', 'firstName', 'lastName', 'password'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, alphaNumericExtendedString(values, 'username', 3, 15));
  Object.assign(errors, email(values, 'email'));
  Object.assign(errors, nameRegexString(values, 'firstName', 3, 50));
  Object.assign(errors, nameRegexString(values, 'lastName', 3, 50));

  if (!PASSWORD_REGEX.test(values.get('password'))) {
    errors.password = 'Das Passwort muss mindestens 8 Zeichen lang sein und Buchstaben und Zahlen enthalten';
  }

  return errors;
}

export default validate;
