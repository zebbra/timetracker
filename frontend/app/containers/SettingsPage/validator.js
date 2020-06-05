import { fromJS } from 'immutable';
import { twoDecimalsNumber, required, percentNumber, dateBeforeAndAfter } from 'utils/generic-validators';

export const validate = (value) => twoDecimalsNumber(fromJS({ value }), 'value', true);

function validateEmployment(values) {
  const errors = {};
  const requiredFields = ['scope', 'start'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, percentNumber(values, 'scope'));
  Object.assign(errors, dateBeforeAndAfter(values, 'start', 'end'));

  return errors;
}

export default validate;
export {
  validateEmployment,
};
