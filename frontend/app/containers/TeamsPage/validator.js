import { nameRegexString, required } from 'utils/generic-validators';

function validate(values) {
  const errors = {};
  const requiredFields = ['name', 'members'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, nameRegexString(values, 'name', 3, 100));

  return errors;
}

export default validate;
