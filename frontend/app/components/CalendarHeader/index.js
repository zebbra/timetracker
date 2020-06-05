/**
*
* CalendarHeader
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { Box } from 'grid-styled';
import Sticky from 'react-sticky-el';

import Wrapper from './Wrapper';


function CalendarHeader(props) {
  const { isLabel, actual, target, day } = props;
  const classes = ['calendar-header'];
  if (isLabel) {
    classes.push('label');
  }

  return (
    <Sticky scrollElement=".mainContent">
      <Wrapper wrap is="section" p="5px" className={classes.join(' ')}>
        <Box is="section">
          {day.format('dd')}
        </Box>
        <Box ml="auto" is="section">
          {actual || 0} / {target || 0}
        </Box>
        <Box width={1} is="section">
          {day.format('DD. MMM YY')}
        </Box>
      </Wrapper>
    </Sticky>
  );
}

CalendarHeader.propTypes = {
  // properties
  isLabel: PropTypes.bool,
  day: MomentPropTypes.momentObj.isRequired,
  actual: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
};

export default CalendarHeader;
