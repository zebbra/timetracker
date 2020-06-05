/**
*
* Datepicker
*
* Simple material-ui datepicker which, however, does not trigger on an input field
* but on a button. We try to load the german intl DateTimeFormat. Upon failure we
* take the default english.
*
* Triggers `selectDate` method from the Calendar container onChange.
*/

import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import areIntlLocalesSupported from 'intl-locales-supported';
import DatePicker from 'material-ui/DatePicker';

import DatePickerWrapper from './Wrapper';

let DateTimeFormat;
let locale = 'de';

if (areIntlLocalesSupported(['de'])) {
  DateTimeFormat = global.Intl.DateTimeFormat;
} else {
  locale = 'en-US';
}


export class Datepicker extends React.PureComponent {

  shouldComponentUpdate(nextProps) {
    const selectedDateChanged = !this.props.value.isSame(nextProps.value, 'day');

    return selectedDateChanged;
  }

  render() {
    if (this.props.inline === true) {
      return (
        <DatePickerWrapper
          floatingLabelText={this.props.label}
          name={this.props.name}
          value={this.props.value.toDate()}
          onChange={this.props.selectDate}
          cancelLabel={this.props.cancelLabel ? this.props.cancelLabel : 'Abbrechen'}
          DateTimeFormat={DateTimeFormat}
          locale={locale}
          fullWidth
          ref={this.props.datepickerRef}
          minDate={this.props.minDate}
        />
      );
    }

    return (
      <DatePicker
        name={this.props.name}
        value={this.props.value.toDate()}
        onChange={this.props.selectDate}
        cancelLabel={this.props.cancelLabel ? this.props.cancelLabel : 'Abbrechen'}
        DateTimeFormat={DateTimeFormat}
        locale={locale}
        ref={this.props.datepickerRef}
        style={{ display: `${this.props.hidden ? 'none' : 'inherit'}` }}
        minDate={this.props.minDate}
      />
    );
  }
}

Datepicker.propTypes = {
  // properties
  name: PropTypes.string.isRequired,
  value: MomentPropTypes.momentObj.isRequired,
  cancelLabel: PropTypes.string,
  hidden: PropTypes.bool,
  minDate: PropTypes.instanceOf(Date),
  datepickerRef: PropTypes.func,
  inline: PropTypes.bool,
  label: PropTypes.string,
  // actions
  selectDate: PropTypes.func.isRequired,
};

export default Datepicker;
