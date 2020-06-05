/*
 *
 * ProfilePage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { createStructuredSelector } from 'reselect';
import { fromJS } from 'immutable';
import { Flex, Box } from 'grid-styled';

import RowHeader from 'components/RowHeader';
import Form from 'containers/Form';
import { userContext } from 'hocs';

import { PROFILE_FORM, PASSWORD_FORM, DELETE_USER_FORM } from './constants';
import { fetchProfile, editProfile, editPassword, deleteUser } from './routines';
import makeSelectProfilePage from './selectors';
import validateProfile, { validatePassword, validateDeleteUser } from './validator';
import { profileData, profileActionButtons, passwordData, passwordActionButtons, deleteUserData, deleteActionButtons } from './dataFormat';


@userContext
export class ProfilePage extends React.PureComponent {

  componentWillMount() {
    this.props.fetchProfile.trigger();
  }

  render() {
    const profileFormInitialValue = fromJS({
      firstName: this.props.ProfilePage.firstName,
      lastName: this.props.ProfilePage.lastName,
      username: this.props.ProfilePage.username,
      email: this.props.ProfilePage.email,
    });

    return (
      <section>
        <RowHeader title={`Profil von ${this.props.ProfilePage.username}`} />
        { this.props.ProfilePage.username && (
          <Flex wrap is="section" px={['16px', '100px', '200px', '300px', '350px']} py="16px">
            <Box width="100%">
              <h2>Zu deiner Person</h2>
              <Form
                form={PROFILE_FORM}
                onSubmit={this.props.editProfile}
                formFields={profileData}
                actionButtons={profileActionButtons}
                initialValues={profileFormInitialValue}
                validate={validateProfile}
                type="edit"
                enableReinitialize
                disabled={this.props.isImpersonated}
              />
            </Box>
            <Box width="100%">
              <h2>Passwort ändern</h2>
              <Form
                form={PASSWORD_FORM}
                onSubmit={this.props.editPassword}
                formFields={passwordData}
                actionButtons={passwordActionButtons}
                validate={validatePassword}
                type="edit"
                onSubmitSuccess={this.handleOnPasswordSubmitSuccess}
                resetOnSubmitSuccess
                disabled={this.props.isImpersonated}
              />
            </Box>
            <Box width="100%">
              <h2>Profil löschen</h2>
              <p>Gib deinen Benutzernamen an um dein Profil zu löschen. Wenn Du dein Profil löschst, werden alle deine erfassten Daten gelöscht!</p>
              <Form
                form={DELETE_USER_FORM}
                onSubmit={this.props.deleteUser}
                formFields={deleteUserData}
                actionButtons={deleteActionButtons}
                validate={validateDeleteUser}
                initialValues={fromJS({ username: this.props.ProfilePage.username })}
                type="create"
                disabled={this.props.isImpersonated}
              />
            </Box>
          </Flex>
        )}
      </section>
    );
  }
}

ProfilePage.propTypes = {
  // properties
  ProfilePage: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }).isRequired,
  isImpersonated: PropTypes.bool,
  // routiens
  fetchProfile: PropTypes.func.isRequired,
  editProfile: PropTypes.func.isRequired,
  editPassword: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ProfilePage: makeSelectProfilePage(),
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindRoutineCreators({ fetchProfile }, dispatch),
    ...bindRoutineCreators({ editProfile }, dispatch),
    ...bindRoutineCreators({ editPassword }, dispatch),
    ...bindRoutineCreators({ deleteUser }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
