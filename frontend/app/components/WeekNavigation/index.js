/**
*
* WeekNavigation
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import moment from 'moment-timezone';
import FlatButton from 'material-ui/FlatButton';
import HardwareLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import HardwareRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import ActionCalendar from 'material-ui/svg-icons/action/date-range';
import { Box } from 'grid-styled';
import RaisedButton from 'material-ui/RaisedButton';

import DatePicker from 'components/DatePicker';
import { centerPadding } from 'utils/variables';

import Wrapper from './Wrapper';
import Text from './Text';
import Nav from './Nav';
import WeekSaldo from './WeekSaldo';


export class WeekNavigation extends React.PureComponent {

  constructor(props) {
    super(props);

    this.handleToggleCalendar = this.handleToggleCalendar.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);
  }

  handleToggleCalendar() {
    this.datepickerInstance.openDialog();
  }

  handleSelectDate(arg, date) {
    const newDate = moment(date);

    if (!newDate.isSame(this.props.selectedDate)) {
      this.props.selectDate(newDate);
    }
  }

  render() {
    const startOfWeek = moment(this.props.selectedDate.clone().startOf('isoweek')).format('DD MMM');
    const endOfWeek = moment(this.props.selectedDate.clone().endOf('isoweek')).format('DD MMM YYYY');
    const weeklyStats = `${this.props.weeklyActual.toFixed(2)} / ${this.props.weeklyTarget}`;

    return (
      <div>
        <Wrapper is="section" wrap align="center" justify="space-around" px={centerPadding} py={['16px', '0px']}>
          <Text is="section" width={['100%', '50%']} pl={['0px', '0px', `${this.props.paddingLeft}%`]}>
            <span className="week">Woche:</span>
            <span className="week-from">{startOfWeek}</span>
            <span className="week-connector">-</span>
            <span className="week-to">{endOfWeek}</span>
          </Text>
          <Nav is="section" width={['100%', '50%']}>
            <FlatButton
              onTouchTap={() => { this.handleSelectDate(null, moment(this.props.selectedDate).clone().subtract(1, 'week')); }}
              icon={<HardwareLeft />}
              primary
            />
            <FlatButton
              onTouchTap={() => { this.handleSelectDate(null, moment().startOf('isoweek').add(this.props.selectedDate.isoWeekday() - 1, 'day')); }}
              label="Aktuelle Woche"
              primary
            />
            <FlatButton
              onTouchTap={() => { this.handleSelectDate(null, moment(this.props.selectedDate).clone().add(1, 'week')); }}
              icon={<HardwareRight />}
              primary
            />
            <FlatButton
              onTouchTap={this.handleToggleCalendar}
              icon={<ActionCalendar />}
              primary
            />
            <DatePicker
              name={'time-page-date-picker'}
              value={this.props.selectedDate}
              selectDate={this.handleSelectDate}
              datepickerRef={(datepickerInstance) => { this.datepickerInstance = datepickerInstance; }}
              minDate={this.props.minDate}
              hidden
            />
          </Nav>
        </Wrapper>

        <WeekSaldo is="section" wrap align="right" justify="flex-end" px={centerPadding} py={['16px', '0px']}>
          <Box ml="auto">
            <RaisedButton
              width={['50%']}
              disabled
              label={weeklyStats}
            />
          </Box>
        </WeekSaldo>
      </div>
    );
  }
}

WeekNavigation.propTypes = {
  // properties
  selectedDate: MomentPropTypes.momentObj,
  paddingLeft: PropTypes.number.isRequired,
  minDate: PropTypes.instanceOf(Date).isRequired,
  weeklyActual: PropTypes.number.isRequired,
  weeklyTarget: PropTypes.number.isRequired,
  // actions
  selectDate: PropTypes.func.isRequired,
};

WeekNavigation.defaultProps = {
  minDate: moment().subtract(4, 'years').startOf('year').toDate(),
};

export default WeekNavigation;
