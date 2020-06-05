/**
*
* CardHeader
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from './Wrapper';


function CardHeader(props) {
  const { title } = props;

  return <Wrapper title={title} />;
}

CardHeader.propTypes = {
  // properties
  title: PropTypes.string.isRequired,
};

export default CardHeader;
