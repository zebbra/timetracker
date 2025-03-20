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

  if (values.get('flat') && values.get('comments')) {
    Object.assign(errors, { _error: 'Werte zusammenfassen und Bemerkungen können nicht gleichzeitig aktiviert sein.' });
  }

  if (values.get('flat') && values.get('compact')) {
    Object.assign(errors, { _error: 'Werte zusammenfassen und Kompakt können nicht gleichzeitig aktiviert sein.' });
  }

  if (values.get('comments') && values.get('position')) {
    Object.assign(errors, { _error: 'Bemerkungen und Position können nicht gleichzeitig aktiviert sein.' });
  }

  return errors;
}


export default validate;

export {
  validateExport,
};
