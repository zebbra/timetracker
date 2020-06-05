import { required, nameRegexString, PASSWORD_REGEX } from 'utils/generic-validators';

function validateProfile(values) {
  const errors = {};
  const requiredFields = ['firstName', 'lastName'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, nameRegexString(values, 'firstName', 3, 50));
  Object.assign(errors, nameRegexString(values, 'lastName', 3, 50));

  return errors;
}

function validatePassword(values) {
  const errors = {};
  const requiredFields = ['oldPassword', 'newPassword', 'confirmPassword'];

  Object.assign(errors, required(values, requiredFields));

  if (!PASSWORD_REGEX.test(values.get('newPassword'))) {
    errors.newPassword = 'Das Passwort muss mindestens 8 Zeichen lang sein und Buchstaben und Zahlen enthalten';
  } else if (values.get('newPassword') !== values.get('confirmPassword')) {
    errors.confirmPassword = 'Die Passwörter stimmen nicht überein';
  } else if (values.get('newPassword') === values.get('oldPassword')) {
    errors.newPassword = 'Das neue Passwort darf nicht dem alten entsprechen';
  }

  return errors;
}

function validateDeleteUser(values) {
  const errors = {};
  const requiredFields = ['confirmationUsername'];

  Object.assign(errors, required(values, requiredFields));

  return errors;
}

export default validateProfile;
export {
  validatePassword,
  validateDeleteUser,
};
