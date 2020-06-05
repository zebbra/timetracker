/*
 *
 * Context
 *
 * Higher order component to ensure the current user has enough rights for the component to display
 * http://engineering.blogfoster.com/higher-order-components-theory-and-practice/
 */

import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { includes, intersection } from 'lodash';

import currentUser from 'hocs/CurrentUser';

const skipLocations = ['/unauthorized'];


@currentUser
export default function Context(Component, options) {
  class AuthorizedComponent extends React.Component {

    componentDidMount() {
      this.checkAndRedirect();
    }

    checkAndRedirect() {
      const { location: { pathname }, isImpersonated } = this.props;
      if (
        includes(skipLocations, pathname) ||
        (isImpersonated && pathname === '/impersonate')
      ) {
        return;
      }

      const { redirectTo, roles, fromOriginRoles = false } = options || {};

      if (intersection(roles, this.props.roles.toJS()).length === 0) {
        if (fromOriginRoles) {
          if (intersection(roles, this.props.originRoles.toJS()).length === 0) {
            this.props.changeRoute(redirectTo || '/unauthorized');
          }
        } else {
          this.props.changeRoute(redirectTo || '/unauthorized');
        }
      }
    }

    render() {
      return <Component {...this.props} />;
    }
  }

  AuthorizedComponent.propTypes = {
    // properties
    roles: ImmutablePropTypes.list,
    originRoles: ImmutablePropTypes.list,
    location: PropTypes.object.isRequired,
    isImpersonated: PropTypes.bool,
    // actions
    changeRoute: PropTypes.func.isRequired,
  };

  function mapDispatchToProps(dispatch) {
    return {
      changeRoute: (url) => dispatch(push(url)),
    };
  }

  return connect(null, mapDispatchToProps)(AuthorizedComponent);
}
