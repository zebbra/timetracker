/*
 *
 * Column
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import CalendarHeader from 'components/CalendarHeader';

import { makeSelectDailyActual, makeSelectDailyTarget } from './selectors';

import Regions from './Regions';
import ColumnWrapper from './Wrapper';


export class Column extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const weekday = this.props.dayOfWeek.weekday();
    const classes = ['calendar-column'];
    let columnIndex;
    if (this.props.isLabel) {
      classes.push('label');
    } else if (weekday === 0) {
      columnIndex = 'first';
    } else if (weekday + 1 === this.props.daysPerWeek) {
      columnIndex = 'last';
    }

    return (
      <ColumnWrapper
        is="section"
        key={`calendar-column-${weekday}`}
        width={['100%', '100%', (1 / (this.props.daysPerWeek + 1))]}
        className={classes.join(' ')}
      >
        <CalendarHeader
          isLabel={this.props.isLabel}
          day={this.props.dayOfWeek}
          actual={this.props.dailyActual || 0}
          target={this.props.dailyTarget || 0}
        />
        <Regions
          isLabel={this.props.isLabel}
          dayOfWeek={this.props.dayOfWeek}
          isImpersonated={this.props.isImpersonated}
          columnIndex={columnIndex}
        />
      </ColumnWrapper>
    );
  }
}

Column.propTypes = {
  // properties
  isLabel: PropTypes.bool,
  daysPerWeek: PropTypes.number.isRequired,
  dayOfWeek: MomentPropTypes.momentObj.isRequired,
  dailyActual: PropTypes.number,
  dailyTarget: PropTypes.number,
  isImpersonated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => createStructuredSelector({
  dailyActual: makeSelectDailyActual(ownProps.dayOfWeek.weekday().toString()),
  dailyTarget: makeSelectDailyTarget(ownProps.dayOfWeek.weekday().toString()),
});

export default connect(mapStateToProps)(Column);
