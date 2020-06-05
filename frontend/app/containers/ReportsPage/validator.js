import { fromJS } from 'immutable';
import { required, dateBeforeAndAfter, dateSameYear, twoDecimalsNumber, textField } from 'utils/generic-validators';

// export const validate = (value) => twoDecimalsNumber(fromJS({ value }), 'value', true);
export const validate = {
  manualCorrection: (manualCorrection) => twoDecimalsNumber(fromJS({ manualCorrection }), 'manualCorrection', true),
  manualCorrectionDescription: (manualCorrectionDescription) => textField(fromJS({ manualCorrectionDescription }), 'manualCorrectionDescription', true),
};

function validateExport(values) {
  const errors = {};
  const requiredFields = ['start', 'end'];

  Object.assign(errors, required(values, requiredFields));
  Object.assign(errors, dateBeforeAndAfter(values, 'start', 'end'));
  Object.assign(errors, dateSameYear(values, 'start', 'end'));

  return errors;
}


export default validate;

export {
  validateExport,
};
