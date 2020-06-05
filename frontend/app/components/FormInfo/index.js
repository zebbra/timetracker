/**
*
* FormError
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from './Wrapper';


function FormInfo(props) {
  return (
    <Wrapper>
      {props.children}
    </Wrapper>
  );
}

FormInfo.propTypes = {
  // properties
  children: PropTypes.node.isRequired,
};

export default FormInfo;
