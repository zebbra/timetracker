/*
 *
 * CalendarInput
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import keydown from 'react-keydown';
import enhanceWithClickOutside from 'react-click-outside';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map } from 'immutable';

import CalendarCell from 'components/CalendarCell';
import { setNavigation, navigate } from 'containers/Calendar/actions';
import { UNITS } from 'containers/Calendar/constants';

import { CALENDAR_INPUT_FORM } from './constants';
import { submitCalendarForm } from './routines';
import validate from './validator';
import normalize from './normalizer';
import Wrapper from './Wrapper';
import Form from './Form';


@enhanceWithClickOutside
export class CalendarInput extends React.PureComponent {

  constructor(props) {
    super(props);

    this.handleOnKeydown = this.handleOnKeydown.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const updatedTrack = this.props.element.get('track') !== undefined && nextProps.element.get('track') === undefined;
    const updatedSlots = this.props.element.get('slots').length !== nextProps.element.get('slots').length;
    return updatedTrack || updatedSlots;
  }

  // store the navigation information in the redux store and apply the navigation after the form submit
  @keydown('left', 'shift+left', 'right', 'shift+right', 'up', 'down', 'tab', 'shift+tab', 'enter', 'esc')
  handleOnKeydown(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      this.props.navigate({});
    } else {
      this.props.setNavigation(event);
      // for closed elements we do not render an input form and therefor submit will not be triggered and thus
      // we have to call navigate manually
      if (this.props.element.get('closed')) {
        (this.props.navigate({ fromStore: true }));
      }
    }
  }

  handleClickOutside() {
    this.props.navigate({});
  }

  render() {
    if (this.props.element.get('closed')) {
      return (
        <CalendarCell
          element={this.props.element}
          region={this.props.region}
          isLabel={this.props.isLabel}
          navigate={this.props.navigate}
        />
      );
    }

    // load the validator and normalizer based on the elements unit
    const validator = validate(this.props.element.get('unit'), this.props.element.get('slots'));
    const normalizer = normalize(this.props.element.get('unit'));

    // set the default form values for the element
    let initialValues = Map({
      id: null,
      value: null,
      date: this.props.element.get('dayOfWeek'),
      elementId: this.props.element.get('id'),
      unit: this.props.element.get('unit'),
    });

    // add the track values if there is one given
    if (this.props.element.getIn(['track', 'value'])) {
      initialValues = initialValues.merge(Map({
        value: this.props.element.getIn(['track', 'value']).toString(),
        id: this.props.element.getIn(['track', 'id']),
      }));
    }

    return (
      <Wrapper>
        <Form
          form={`${CALENDAR_INPUT_FORM}_${this.props.element.get('index')}`}
          onSubmit={this.props.submitCalendarForm.trigger}
          handleOnKeydown={this.handleOnKeydown}
          element={this.props.element}
          initialValues={initialValues}
          validator={validator}
          normalizer={normalizer}
          navigate={this.props.navigate}
        />
      </Wrapper>
    );
  }
}

CalendarInput.propTypes = {
  // properties
  isLabel: PropTypes.bool,
  region: ImmutablePropTypes.contains({
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
  }),
  element: ImmutablePropTypes.contains({
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    label: PropTypes.string,
    unit: PropTypes.oneOf(UNITS).isRequired,
    type: PropTypes.string.isRequired,
    dayOfWeek: PropTypes.instanceOf(Date).isRequired,
    holiday: PropTypes.bool,
    hidden: PropTypes.bool,
    hiddenWithTrack: PropTypes.bool,
    disabled: PropTypes.bool,
    closed: PropTypes.bool,
    selected: PropTypes.bool,
    track: PropTypes.object,
  }),
  // actions
  navigate: PropTypes.func.isRequired,
  setNavigation: PropTypes.func.isRequired,
  // routines
  submitCalendarForm: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    navigate: bindActionCreators(navigate, dispatch),
    setNavigation: bindActionCreators(setNavigation, dispatch),
    ...bindRoutineCreators({ submitCalendarForm }, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(CalendarInput);
