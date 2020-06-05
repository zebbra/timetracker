import { nameRegexString, dateBeforeAndAfter, twoDecimalsNumber, required } from 'utils/generic-validators';

function validate(values) {
  const errors = {};
  const requiredFields = ['project', 'label', 'type', 'unit', 'factor', 'start'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, nameRegexString(values, 'label', 3, 100));
  Object.assign(errors, twoDecimalsNumber(values, 'factor'));
  Object.assign(errors, dateBeforeAndAfter(values, 'start', 'end'));

  return errors;
}

export default validate;
