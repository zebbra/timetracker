/**
*
* FormError
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from './Wrapper';


function FormError(props) {
  return (
    <Wrapper>
      {props.children}
    </Wrapper>
  );
}

FormError.propTypes = {
  // properties
  children: PropTypes.node.isRequired,
};

export default FormError;
