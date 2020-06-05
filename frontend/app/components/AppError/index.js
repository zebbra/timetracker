/**
*
* AppError
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import Wrapper from './Wrapper';


function AppError(props) {
  const { appError } = props;
  const { hideAppError } = props;

  const hasError = !(Object.keys(appError).length === 0 && appError.constructor === Object);
  let status;
  let message;
  let finalMessage;

  if (hasError) {
    status = appError.status ? appError.status : get(appError, ['response', 'status']);
    message = appError.message ? appError.message : get(appError, ['response', 'statusText']);
  }

  if (status === 422) {
    finalMessage = 'Fehler';
  } else if (status) {
    finalMessage = `HTTP Status Code ${status}: ${message}`;
  } else {
    finalMessage = message;
  }

  return appError.response ?
    <Wrapper
      open={hasError}
      autoHideDuration={3000}
      message={finalMessage}
      onRequestClose={hideAppError}
    /> : null;
}

AppError.propTypes = {
  // properties
  appError: PropTypes.object.isRequired,
  // actions
  hideAppError: PropTypes.func.isRequired,
};

export default AppError;
