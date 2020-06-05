/**
*
* Link
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import Wrapper from './Wrapper';


function Link(props) {
  const { onClick } = props;

  return (
    <Wrapper onClick={() => onClick()}>
      {props.children}
    </Wrapper>
  );
}

Link.propTypes = {
  // properties
  children: PropTypes.node.isRequired,
  // actions
  onClick: PropTypes.func.isRequired,
};

export default Link;
