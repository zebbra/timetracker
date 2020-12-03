/*
 *
 * CurrentUser
 *
 */

import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import {
  makeSelectUsername,
  makeSelectFirstName,
  makeSelectLastName,
  makeSelectRoles,
  makeSelectOriginRoles,
  makeSelectOriginUsername,
  makeSelectTeams,
} from 'hocs/Session/selectors';

export default function CurrentUser(Component) {
  function PersonalisedComponent(props) {
    const isSuperAdmin = props.roles.includes('super-admin') || props.originRoles.includes('super-admin');
    const isImpersonated = !isSuperAdmin && props.roles.includes('impersonated');
    const isUser = props.roles.includes('user');
    const isAdmin = props.roles.includes('admin');
    const isTeamleader = props.roles.includes('teamleader') || props.originRoles.includes('teamleader');

    return (<Component
      {...props}
      isImpersonated={isImpersonated}
      isUser={isUser}
      isTeamleader={isTeamleader}
      isAdmin={isAdmin}
      isSuperAdmin={isSuperAdmin}
    />);
  }

  PersonalisedComponent.propTypes = {
    roles: ImmutablePropTypes.list.isRequired,
    originRoles: ImmutablePropTypes.list.isRequired,
  };

  PersonalisedComponent.defaultProps = {
    // properties
    username: '',
    firstName: '',
    lastName: '',
    originUsername: '',
    isUser: false,
    isTeamleader: false,
    isAdmin: false,
    isSuperAdmin: false,
    teams: [],
  };

  const mapStateToProps = createStructuredSelector({
    username: makeSelectUsername(),
    firstName: makeSelectFirstName(),
    lastName: makeSelectLastName(),
    roles: makeSelectRoles(),
    originRoles: makeSelectOriginRoles(),
    originUsername: makeSelectOriginUsername(),
    teams: makeSelectTeams(),
  });

  return connect(mapStateToProps)(PersonalisedComponent);
}
