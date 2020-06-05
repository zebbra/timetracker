/*
 *
 * Form
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Field, reduxForm, formValueSelector, getFormSyncErrors } from 'redux-form/immutable';
import { TextField } from 'redux-form-material-ui';
import { includes } from 'lodash';

import { showAppError } from 'containers/App/actions';
import { MediTheme } from 'utils/theme';

import { UNIT_TO_HINT_LOOKUP, NAVIGATION_KEYS } from './constants';
import { setInitialValue } from './actions';
import { FormWrapper } from './Wrapper';

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

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  componentWillMount() {
    this.props.setInitialValue(this.props.initialValues.get('value'));
  }

  handleKeyDown(event) {
    if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    if (includes(NAVIGATION_KEYS, event.key) && !this.props.submitting) {
      if (this.props.value && includes(['ArrowLeft', 'ArrowRight'], event.key)) {
        if (event.shiftKey) {
          this.props.handleOnKeydown(event);
          if (this.props.valid) {
            this.props.submit();
          } else {
            const err = new Error(this.props.syncError.value);
            this.props.showAppError(Object.assign(err, { response: true }));
            this.props.navigate({ fromStore: true });
          }
        }
      } else {
        this.props.handleOnKeydown(event);
        if (this.props.valid) {
          this.props.submit();
        } else {
          const err = new Error(this.props.syncError.value);
          this.props.showAppError(Object.assign(err, { response: true }));
          this.props.navigate({ fromStore: true });
        }
      }
    }
  }

  handleOnBlur() {
    if (this.props.valid) {
      this.props.submit();
    }
  }

  render() {
    const emptyErrorNode = <span />;

    return (
      <FormWrapper onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <Field
          name="value"
          component={TextField}
          hintText={UNIT_TO_HINT_LOOKUP[this.props.element.get('unit')]}
          errorText={!this.props.valid && emptyErrorNode}
          fullWidth
          floatingLabelStyle={floatingColor}
          floatingLabelFixed
          underlineFocusStyle={floatingColor}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          autoFocus
          onBlur={this.handleOnBlur}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          validate={this.props.validator}
          normalize={this.props.normalizer}
        />
      </FormWrapper>
    );
  }
}

Form.propTypes = {
  // properties
  element: PropTypes.object.isRequired,
  // actions
  onSubmit: PropTypes.func.isRequired,
  validator: PropTypes.func.isRequired,
  normalizer: PropTypes.func.isRequired,
  handleOnKeydown: PropTypes.func.isRequired,
  setInitialValue: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  showAppError: PropTypes.func.isRequired,
  // redux-form props
  value: PropTypes.string,
  valid: PropTypes.bool.isRequired,
  submit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object.isRequired,
  syncError: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  const selector = formValueSelector(ownProps.form);
  const errorSelector = getFormSyncErrors(ownProps.form);
  return {
    value: selector(state, 'value'),
    syncError: errorSelector(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setInitialValue: bindActionCreators(setInitialValue, dispatch),
    showAppError: bindActionCreators(showAppError, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  enableReinitialize: true,
})(Form));
