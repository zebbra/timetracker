/*
 *
 * LoginPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Flex, Box } from 'grid-styled';
import { Card, CardText } from 'material-ui/Card';

import Form from 'containers/Form';
import { currentUser } from 'hocs';

import Link from 'components/Link';
import FormError from 'components/FormError';
import FormInfo from 'components/FormInfo';
import CardHeader from 'components/CardHeader';
import { setComponent as setSignupComponent } from 'containers/SignupPage/actions';

import { LOGIN_FORM, FORGOT_PASSWORD_FORM, NEW_PASSWORD_FORM } from './constants';
import { setComponent as setLoginComponent } from './actions';
import { login, verifyUser, requestPasswordReset, passwordReset } from './routines';
import { makeSelectError, makeSelectInfo, makeSelectComponent, makeSelectUid, makeSelectToken } from './selectors';
import { loginData, loginActionButtons, resetData, resetActionButton, newPasswordData, newPasswordButton } from './dataFormat';
import validate, { validatePasswordForm, validateNewPasswordForm } from './validator';
import Wrapper from './Wrapper';


@currentUser
export class LoginPage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.handleOnVerifyUserClick = this.handleOnVerifyUserClick.bind(this);
    this.handleOnLoginClick = this.handleOnLoginClick.bind(this);
    this.handleOnSignupClick = this.handleOnSignupClick.bind(this);
    this.handleOnForgotPasswordClick = this.handleOnForgotPasswordClick.bind(this);

    this.renderNewPasswordForm = this.renderNewPasswordForm.bind(this);
    this.renderForgotPasswordForm = this.renderForgotPasswordForm.bind(this);
    this.renderLoginForm = this.renderLoginForm.bind(this);
    this.renderVerifyUser = this.renderVerifyUser.bind(this);
    this.renderVerifyingUser = this.renderVerifyingUser.bind(this);
  }

  componentWillMount() {
    if (this.props.username) {
      this.props.changeRoute('/');
    } else if (this.props.component === 'apply') {
      this.handleOnVerifyUserClick();
    } else if (this.props.location.pathname === '/reset') {
      this.props.setLoginComponent({ component: 'password', token: this.props.location.query.token });
    }
  }

  handleOnVerifyUserClick() {
    this.props.setLoginComponent({ component: 'verifying', uid: this.props.uid });
    this.props.verifyUser.trigger();
  }

  handleOnLoginClick() {
    this.props.setLoginComponent({ component: 'login' });
  }

  handleOnSignupClick() {
    this.props.setSignupComponent({ component: 'signup' });
    this.props.changeRoute('/signup');
  }

  handleOnForgotPasswordClick() {
    this.props.setLoginComponent({ component: 'reset', info: 'Du erhälst von uns eine Email mit den Instruktionen zum Zurücksetzen deines Passwortes.' });
  }

  renderNewPasswordForm() {
    return (
      <Card>
        <CardHeader title="Neues Passwort setzen" />
        { this.props.info && <CardText><FormInfo>{this.props.info}</FormInfo></CardText>}
        { this.props.error && <CardText><FormError>{this.props.error}</FormError></CardText>}
        <Form
          form={NEW_PASSWORD_FORM}
          validate={validateNewPasswordForm}
          onSubmit={this.props.passwordReset}
          formFields={newPasswordData}
          actionButtons={newPasswordButton}
          type="create"
        />
        <Flex wrap px="16px" pb="16px">
          <Box ml="auto">
            <Link onClick={this.handleOnLoginClick}>Anmelden</Link>
          </Box>
        </Flex>
      </Card>
    );
  }

  renderForgotPasswordForm() {
    return (
      <Card>
        <CardHeader title="Passwort zurücksetzen" />
        { this.props.info && <CardText><FormInfo>{this.props.info}</FormInfo></CardText>}
        { this.props.error && <CardText><FormError>{this.props.error}</FormError></CardText>}
        <Form
          form={FORGOT_PASSWORD_FORM}
          validate={validatePasswordForm}
          onSubmit={this.props.requestPasswordReset}
          formFields={resetData}
          actionButtons={resetActionButton}
          type="create"
        />
        <Flex wrap px="16px" pb="16px">
          <Box ml="auto">
            <Link onClick={this.handleOnLoginClick}>Anmelden</Link>
          </Box>
        </Flex>
      </Card>
    );
  }

  renderLoginForm() {
    return (
      <Card>
        <CardHeader title="Bitte Anmelden" />
        { this.props.info && <CardText><FormInfo>{this.props.info}</FormInfo></CardText>}
        { this.props.error && <CardText><FormError>{this.props.error}</FormError></CardText>}
        <Form
          form={LOGIN_FORM}
          initialValues={fromJS({
            rememberMe: true,
          })}
          validate={validate}
          onSubmit={this.props.login}
          formFields={loginData}
          actionButtons={loginActionButtons}
          type="create"
        />
        <Flex wrap px="16px" pb="16px">
          <Box>
            <a
              href="https://www.youtube.com/playlist?list=PLcekKu9NqG7HvtWnQ-UVK8-JBmbuTwlnZ"
              target="_blank"
              style={{ textDecoration: 'none' }}
            >
              Hilfe
            </a>
          </Box>
          <Box ml="auto">
            <Link onClick={this.handleOnForgotPasswordClick}>Passwort vergessen</Link>
            <Link onClick={this.handleOnSignupClick}>Registrieren</Link>
          </Box>
        </Flex>
      </Card>
    );
  }

  renderVerifyUser() {
    return (
      <Card>
        <CardHeader title="Email Verifizieren" />
        <CardText>
          { this.props.info && <CardText><FormInfo>{this.props.info}</FormInfo></CardText>}
          { this.props.error && <CardText><FormError>{this.props.error}</FormError></CardText>}
          <span>
            Du hast von uns eine Email zum Bestätigen deines Profiles erhalten. Falls Du das Email nicht erhalten / gelöscht hast, kannst Du
          </span>
          <Link onClick={this.handleOnVerifyUserClick}>
            hier
          </Link>
          <span>
            klicken, um das Email erneut zu erhalten.
          </span>
        </CardText>
        <Flex wrap px="16px" pb="16px">
          <Box ml="auto">
            <Link onClick={this.handleOnLoginClick}>Anmelden</Link>
          </Box>
        </Flex>
      </Card>
    );
  }

  renderVerifyingUser() {
    return (
      <Card>
        <CardHeader title="Email Verifizieren" />
        <CardText>
          Bitte habe etwas Geduld während deine Email-Adresse verifiziert wird.
        </CardText>
      </Card>
    );
  }

  render() {
    return (
      <Wrapper>
        <Flex
          wrap
          is="section"
          px={['16px', '150px', '200px', '300px', '400px']}
          mt={['16px', '16px', '50px']}
        >
          { this.props.component === 'login' ? this.renderLoginForm() : null}
          { this.props.component === 'verify' ? this.renderVerifyUser() : null}
          { this.props.component === 'verifying' ? this.renderVerifyingUser() : null}
          { this.props.component === 'reset' ? this.renderForgotPasswordForm() : null}
          { this.props.component === 'password' ? this.renderNewPasswordForm() : null}
        </Flex>
      </Wrapper>
    );
  }
}

LoginPage.propTypes = {
  // properties
  component: PropTypes.oneOf(['login', 'verify', 'verifying', 'apply', 'reset', 'password']).isRequired,
  uid: PropTypes.string,
  error: PropTypes.string,
  info: PropTypes.string,
  token: PropTypes.string,
  location: PropTypes.object.isRequired,
  // session
  username: PropTypes.string,
  // functions
  changeRoute: PropTypes.func.isRequired,
  setLoginComponent: PropTypes.func.isRequired,
  setSignupComponent: PropTypes.func.isRequired,
  // routines
  login: PropTypes.func.isRequired,
  verifyUser: PropTypes.func.isRequired,
  requestPasswordReset: PropTypes.func.isRequired,
  passwordReset: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  component: makeSelectComponent(),
  uid: makeSelectUid(),
  error: makeSelectError(),
  info: makeSelectInfo(),
  token: makeSelectToken(),
});

function mapDispatchToProps(dispatch) {
  return {
    changeRoute: (url) => dispatch(push(url)),
    setLoginComponent: bindActionCreators(setLoginComponent, dispatch),
    setSignupComponent: bindActionCreators(setSignupComponent, dispatch),
    ...bindRoutineCreators({ login }, dispatch),
    ...bindRoutineCreators({ verifyUser }, dispatch),
    ...bindRoutineCreators({ requestPasswordReset }, dispatch),
    ...bindRoutineCreators({ passwordReset }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
