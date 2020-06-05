/*
 *
 * SignupPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { createStructuredSelector } from 'reselect';
import { Flex, Box } from 'grid-styled';
import { Card, CardText } from 'material-ui/Card';

import Link from 'components/Link';
import CardHeader from 'components/CardHeader';
import Form from 'containers/Form';
import { setComponent as setLoginComponent } from 'containers/LoginPage/actions';
import { makeSelectToken } from 'hocs/Session/selectors';
import { deleteSession } from 'hocs/Session/routines';

import Wrapper from './Wrapper';
import { SIGNUP_FORM } from './constants';
import { setComponent as setSignupComponent } from './actions';
import { createUser, confirmEmail } from './routines';
import { makeSelectComponent } from './selectors';
import validate from './validator';
import { formFields, actionButtons } from './dataFormat';


export class SignupPage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.handleOnVerifyUserClick = this.handleOnVerifyUserClick.bind(this);
    this.handleOnLoginClick = this.handleOnLoginClick.bind(this);

    this.renderConfirmationError = this.renderConfirmationError.bind(this);
    this.renderSignupForm = this.renderSignupForm.bind(this);
  }

  componentWillMount() {
    if (this.props.location.pathname === '/api/users/confirm') {
      this.props.setSignupComponent({ component: 'confirm' });
      this.props.confirmEmail.trigger(this.props.location.query);
    } else if (this.props.token) {
      this.props.deleteSession();
    }
  }

  handleOnVerifyUserClick() {
    this.props.setLoginComponent({ component: 'apply', uid: this.props.location.query.uid });
    this.props.changeRoute('/login');
  }

  handleOnLoginClick() {
    this.props.setLoginComponent({ component: 'login' });
    this.props.changeRoute('/login');
  }

  renderConfirmationError() {
    return (
      <Card>
        <CardHeader title="Bestätigung Fehlgeschlagen" />
        <CardText>
          <span>
          Bei der Bestätigung deiner Email-Adresse ist ein Fehler aufgetreten. Wahrscheinlich ist dein Token bereits abgelaufen oder er wurde bereits einmal bestätigt. Klicke
          </span>
          <Link onClick={this.handleOnVerifyUserClick}>
            hier
          </Link>
          <span>
            hier um einen neuen Token anzufordern.
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

  renderSignupForm() {
    return (
      <Card>
        <CardHeader title="Bitte Registrieren" />
        <Form
          form={SIGNUP_FORM}
          onSubmit={this.props.createUser}
          formFields={formFields}
          actionButtons={actionButtons}
          validate={validate}
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

  render() {
    return (
      <Wrapper>
        <Flex
          wrap
          is="section"
          px={['16px', '150px', '200px', '300px', '400px']}
          mt={['16px', '16px', '50px']}
          className="loginWrapper"
        >
          {this.props.component === 'signup' ? this.renderSignupForm() : null}
          {this.props.component === 'confirm' ? this.renderConfirmationError() : null}
        </Flex>
      </Wrapper>
    );
  }
}

SignupPage.propTypes = {
  // properties
  component: PropTypes.oneOf(['signup', 'confirm']).isRequired,
  location: PropTypes.object.isRequired,
  token: PropTypes.string,
  // actions
  changeRoute: PropTypes.func.isRequired,
  setLoginComponent: PropTypes.func.isRequired,
  setSignupComponent: PropTypes.func.isRequired,
  // routines
  createUser: PropTypes.func.isRequired,
  confirmEmail: PropTypes.func.isRequired,
  deleteSession: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  token: makeSelectToken(),
  component: makeSelectComponent(),
});

function mapDispatchToProps(dispatch) {
  return {
    changeRoute: (url) => dispatch(push(url)),
    setLoginComponent: bindActionCreators(setLoginComponent, dispatch),
    setSignupComponent: bindActionCreators(setSignupComponent, dispatch),
    ...bindRoutineCreators({ createUser }, dispatch),
    ...bindRoutineCreators({ deleteSession }, dispatch),
    ...bindRoutineCreators({ confirmEmail }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupPage);
