/*
 *
 * Calendar
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { Flex } from 'grid-styled';

import { makeSelectPrinting } from 'containers/App/selectors';
import WeekNavigation from 'components/WeekNavigation';
import { centerPadding } from 'utils/variables';

import { navigate, selectDate } from './actions';
import { fetchAllData } from './routines';
import {
  makeSelectDaysPerWeek,
  makeSelectSelectedDate,
  makeSelectWeeklyActual,
  makeSelectWeeklyTarget,
} from './selectors';

import Column from './Column';
import CalendarTable from './Table';


export class Calendar extends React.PureComponent {

  componentWillMount() {
    this.props.fetchAllData.trigger();
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.selectedDate.isSame(this.props.selectedDate, 'isoweek')) {
      this.props.fetchAllData.trigger();
    }
  }

  render() {
    const calendarColumns = [];
    const startOfWeek = this.props.selectedDate.clone().startOf('isoweek');

    // Render the columns for each day. Weekends can be disabled by user settings
    for (let weekday = 0; weekday < this.props.daysPerWeek; weekday += 1) {
      const dayOfWeek = startOfWeek.clone().add(weekday, 'days');

      if (weekday === 0) {
        // First push the label column with a day index of 7 (0-6 are for MO-SO)
        calendarColumns.push(
          <Column
            key={`calendar-column-${7}`}
            isLabel
            daysPerWeek={this.props.daysPerWeek}
            dayOfWeek={dayOfWeek}
            isImpersonated={this.props.isImpersonated}
          />
        );
      }
      calendarColumns.push(
        <Column
          key={`calendar-column-${weekday}`}
          daysPerWeek={this.props.daysPerWeek}
          dayOfWeek={dayOfWeek}
          isImpersonated={this.props.isImpersonated}
        />
      );
    }

    return (
      <div>
        { this.props.printing && <CalendarTable
          selectedDate={this.props.selectedDate}
          firstName={this.props.firstName}
          lastName={this.props.lastName}
        /> }
        { !this.props.printing && <section>
          <WeekNavigation
            selectedDate={this.props.selectedDate}
            selectDate={this.props.selectDate}
            paddingLeft={100 / (this.props.daysPerWeek + 1)}
            weeklyActual={this.props.weeklyActual}
            weeklyTarget={this.props.weeklyTarget}
          />
          <Flex
            wrap
            is="section"
            px={centerPadding}
            className="calendar"
          >
            {calendarColumns}
          </Flex>
        </section> }
      </div>
    );
  }
}

Calendar.propTypes = {
  // properties
  daysPerWeek: PropTypes.number.isRequired,
  selectedDate: MomentPropTypes.momentObj.isRequired,
  isImpersonated: PropTypes.bool.isRequired,
  weeklyActual: PropTypes.number.isRequired,
  weeklyTarget: PropTypes.number.isRequired,
  printing: PropTypes.bool.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  // actions
  selectDate: PropTypes.func.isRequired,
  // routines
  fetchAllData: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  daysPerWeek: makeSelectDaysPerWeek(),
  selectedDate: makeSelectSelectedDate(),
  weeklyActual: makeSelectWeeklyActual(),
  weeklyTarget: makeSelectWeeklyTarget(),
  printing: makeSelectPrinting(),
});

function mapDispatchToProps(dispatch) {
  return {
    navigate: bindActionCreators(navigate, dispatch),
    selectDate: bindActionCreators(selectDate, dispatch),
    ...bindRoutineCreators({ fetchAllData }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Calendar);
