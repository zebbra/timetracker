import { required, alphaNumericExtendedString, email, PASSWORD_REGEX } from 'utils/generic-validators';

function validate(values) {
  const errors = {};
  const requiredFields = ['value', 'password'];

  Object.assign(errors, required(values, requiredFields));
  if (/@/.test(values.get('value'))) {
    Object.assign(errors, email(values, 'value'));
  } else {
    Object.assign(errors, alphaNumericExtendedString(values, 'value', 3, 52));
  }

  return errors;
}

function validatePasswordForm(values) {
  const errors = {};
  const requiredFields = ['email'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, email(values, 'email'));

  return errors;
}

function validateNewPasswordForm(values) {
  const errors = {};
  const requiredFields = ['newPassword'];

  Object.assign(errors, required(values, requiredFields));
  if (!PASSWORD_REGEX.test(values.get('newPassword'))) {
    errors.newPassword = 'Das Passwort muss mindestens 8 Zeichen lang sein und Buchstaben und Zahlen enthalten';
  }

  return errors;
}

export default validate;

export {
  validatePasswordForm,
  validateNewPasswordForm,
};
