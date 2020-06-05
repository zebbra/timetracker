/*
 *
 * Form
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form/immutable';
import Paper from 'material-ui/Paper';
import { TextField, Checkbox, SelectField, DatePicker } from 'redux-form-material-ui';
import MenuItem from 'material-ui/MenuItem';
import areIntlLocalesSupported from 'intl-locales-supported';
import Select from 'react-select';

import ActionButton from 'components/ActionButton';
import FormError from 'components/FormError';
import DraftEditor from 'components/DraftEditor';
import { MediTheme } from 'utils/theme';

import Wrapper, { Label } from './Wrapper';

let DateTimeFormat;
let locale = 'de';

if (areIntlLocalesSupported(['de'])) {
  DateTimeFormat = global.Intl.DateTimeFormat;
} else {
  locale = 'en-US';
}

// input styles
const floatingColor = {
  color: MediTheme.palette.accent1Color,
  borderColor: MediTheme.palette.accent1Color,
  fontWeight: 100,
  fontSize: '20px',
};


export class Form extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {};

    this.handleOnKeydown = this.handleOnKeydown.bind(this);
    this.renderDraftEditor = this.renderDraftEditor.bind(this);
    this.renderTextField = this.renderTextField.bind(this);
    this.renderCheckBox = this.renderCheckBox.bind(this);
    this.renderSelect = this.renderSelect.bind(this);
    this.renderDateSelect = this.renderDateSelect.bind(this);
  }

  handleOnKeydown(event) {
    if (event.key === 'Enter' && event.shiftKey === false && !this.props.invalid) {
      event.preventDefault();
      this.props.submit();
    }
  }

  renderReactSelect(settings, value, options, onChange) {
    const disabled = this.props.disabled;
    const handleOnChange = (newValue) => {
      this.props.change(settings.name, newValue);
      if (typeof onChange === 'function') {
        onChange(newValue);
      }
    };

    return (
      <section key={`draft-editor-input-${settings.name}`} >
        <Label>{settings.label}</Label>
        <Select
          key={`react-select-input-field-${settings.name}`}
          name={settings.name}
          value={value}
          options={options}
          onChange={handleOnChange}
          onOpen={() => this.setState({ disabledButtons: true })}
          onClose={() => setTimeout(() => this.setState({ disabledButtons: false }), 100)}
          multi
          noResultsText="Keine Einträge gefunden"
          placeholder="Auswählen..."
          disabled={disabled}
        />
      </section>
    );
  }

  renderDraftEditor(settings) {
    const handleOnDraftEditorChange = (value) => {
      this.props.change(settings.name, value);
    };

    return (
      <section key={`draft-editor-input-${settings.name}`} >
        <Label>{settings.label}</Label>
        <DraftEditor
          value={this.props.initialValues.get(settings.name)}
          raw={false}
          onChange={handleOnDraftEditorChange}
        />
      </section>
    );
  }

  renderTextField(settings) {
    const disabled = (this.props.type === 'edit' && settings.disabled) || settings.forceDisable || this.props.submitting || this.props.disabled;

    return (
      <Field
        key={`text-field-input-${settings.name}`}
        name={settings.name}
        component={TextField}
        type={settings.type || 'text'}
        fullWidth
        floatingLabelStyle={floatingColor}
        floatingLabelFixed
        underlineFocusStyle={floatingColor}
        floatingLabelText={settings.label}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        autoFocus={settings.autofocus || false}
        onKeyDown={settings.submitOnEnter ? this.handleOnKeydown : undefined}
        disabled={disabled}
      />
    );
  }

  renderCheckBox(settings) {
    const disabled = (this.props.type === 'edit' && settings.disabled) || this.props.submitting || this.props.disabled;

    return (
      <Field
        key={`check-box-input-${settings.name}`}
        name={settings.name}
        component={Checkbox}
        label={settings.label}
        labelPosition="right"
        style={{ paddingTop: 10, paddingBottom: 20, fontSize: '16px' }}
        disabled={disabled}
      />
    );
  }

  renderSelect(settings) {
    const disabled = (this.props.type === 'edit' && settings.disabled) || this.props.submitting || this.props.disabled;
    const menuItems = settings.options.map((option) => (
      <MenuItem key={`menut-item-${settings.name}-${option.value}`} value={option.value} primaryText={option.label} />
    ));

    return (
      <Field
        key={`select-input-${settings.name}`}
        name={settings.name}
        component={SelectField}
        fullWidth
        floatingLabelStyle={floatingColor}
        floatingLabelFixed
        underlineFocusStyle={floatingColor}
        floatingLabelText={settings.label}
        disabled={disabled}
      >
        {menuItems}
      </Field>
    );
  }

  renderDateSelect(settings) {
    const disabled = (this.props.type === 'edit' && settings.disabled) || this.props.submitting || this.props.disabled;
    const minDate = this.props.initialValues.get(settings.minDate) || this.props.customProperties[settings.minDate];
    const maxDate = this.props.initialValues.get(settings.maxDate) || this.props.customProperties[settings.maxDate];

    return (
      <Field
        key={`date-select-input-${settings.name}`}
        name={settings.name}
        component={DatePicker}
        DateTimeFormat={DateTimeFormat}
        locale={locale}
        format={null}
        cancelLabel="Abbrechen"
        floatingLabelStyle={floatingColor}
        floatingLabelFixed
        underlineFocusStyle={floatingColor}
        floatingLabelText={settings.label}
        fullWidth
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
      />
    );
  }

  renderActionButton(settings, index) {
    let handleAction = () => {};
    if (settings.submitButton) {
      handleAction = this.props.submit;
    } else if (typeof this.props[settings.buttonAction] === 'function') {
      handleAction = this.props[settings.buttonAction];
    }

    let disabled = this.props.submitting;
    if (settings.submitButton) {
      disabled = (this.props.pristine && this.props.initialValid !== true) || this.props.submitting || this.props.invalid;
    }
    if (this.state.disabledButtons) {
      disabled = true;
    }

    const style = {};
    if (index > 0) {
      style.marginLeft = '5px';
    }

    return (
      <ActionButton
        key={`action-button-${settings.label}`}
        handleAction={handleAction}
        label={settings.label}
        type={settings.type}
        primary={settings.primary}
        secondary={settings.secondary}
        disabled={disabled}
        style={style}
      />
    );
  }

  render() {
    const fields = this.props.formFields.map((field) => {
      if (field.fieldType === 'textfield') {
        return this.renderTextField(field);
      } else if (field.fieldType === 'checkbox') {
        return this.renderCheckBox(field);
      } else if (field.fieldType === 'selectfield') {
        return this.renderSelect(field);
      } else if (field.fieldType === 'dateselect') {
        return this.renderDateSelect(field);
      } else if (field.fieldType === 'drafteditor') {
        return this.renderDraftEditor(field);
      } else if (field.fieldType === 'reactSelect') {
        const reactSelect = this.props.customProperties[field.name];
        return this.renderReactSelect(field, reactSelect.value, reactSelect.options, reactSelect.onChange);
      }
      return null;
    });

    const actionButtons = this.props.actionButtons.map((button, index) => this.renderActionButton(button, index));

    return (
      <Wrapper highlight={this.props.highlight} onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <Paper rounded={false}>
          { this.props.error && <FormError>{this.props.error}</FormError> }
          { fields }
          <section style={{ marginTop: '20px' }}>
            { actionButtons }
          </section>
        </Paper>
      </Wrapper>
    );
  }
}

Form.propTypes = {
  // properties
  formFields: PropTypes.array.isRequired,
  actionButtons: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
  initialValues: PropTypes.object,
  customProperties: PropTypes.object.isRequired,
  highlight: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  initialValid: PropTypes.bool,
  // actions
  onSubmit: PropTypes.func.isRequired,
  // redux-form props
  invalid: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  change: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};

Form.defaultProps = {
  customProperties: {},
  highlight: true,
  disabled: false,
};

const mapStateToProps = (state, ownProps) => ({
  form: ownProps.form,
  initialValues: ownProps.initialValues,
  validate: ownProps.validate,
});

export default connect(mapStateToProps)(reduxForm()(Form));
