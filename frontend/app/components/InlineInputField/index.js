/**
*
* InlineInputField
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import { MediTheme } from 'utils/theme';

import TextFieldWrapper from './Wrapper';

// input styles
const floatingColor = {
  color: MediTheme.palette.accent1Color,
  borderColor: MediTheme.palette.accent1Color,
};


class InlineInputField extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      initialValue: undefined,
      value: undefined,
      error: undefined,
    };

    this.handleOnKeydown = this.handleOnKeydown.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleOnFocus = this.handleOnFocus.bind(this);
  }

  componentWillMount() {
    this.setState({ value: this.props.value, initialValue: this.props.value });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value, initialValue: nextProps.value });
  }

  handleOnKeydown(event) {
    if (event.key === 'Enter' && event.shiftKey === false) {
      this.handleOnBlur();
    }
  }

  handleOnChange(event, value) {
    this.setState({
      value,
      error: this.props.validate(value),
    });
  }

  handleOnBlur() {
    const valid = !this.state.error;

    if (valid) {
      if (this.state.value !== this.state.initialValue) {
        this.props.handleOnBlur({ value: this.state.value });
      }
    } else {
      this.setState({
        value: this.state.initialValue,
        error: undefined,
      });
    }
  }

  handleOnFocus() {
    if (this.props.reinitialize) {
      this.setState({
        initialValue: this.state.value,
      });
    }
  }

  render() {
    if (this.props.align) {
      floatingColor.textAlign = this.props.align;
    } else {
      delete floatingColor.textAlign;
    }

    return (
      <TextFieldWrapper
        name={this.props.name}
        value={this.state.value}
        fullWidth
        floatingLabelStyle={floatingColor}
        floatingLabelFixed
        underlineFocusStyle={floatingColor}
        floatingLabelText={this.props.label}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onBlur={this.handleOnBlur}
        onChange={this.handleOnChange}
        onFocus={this.handleOnFocus}
        errorText={this.state.error && <span />}
        onKeyDown={this.handleOnKeydown}
        inputStyle={{ textAlign: this.props.align }}
      />
    );
  }
}

InlineInputField.propTypes = {
  // properties
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  validate: PropTypes.func,
  reinitialize: PropTypes.bool.isRequired,
  align: PropTypes.string,
  // actions
  handleOnBlur: PropTypes.func.isRequired,
};

InlineInputField.defaultProps = {
  value: '',
  reinitialize: true,
};

export default InlineInputField;
