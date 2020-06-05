/* eslint-disable no-console */
/*
 *
 * Session
 *
 * Higher order component to ensure user is logged in
 * http://engineering.blogfoster.com/higher-order-components-theory-and-practice/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import { includes } from 'lodash';

import {
  makeSelectCurrentPath,
} from 'containers/App/selectors';
import { fetchVersion } from 'containers/App/routines';

import {
  makeSelectFirstName,
  makeSelectLastName,
  makeSelectUsername,
  makeSelectToken,
} from './selectors';

const skipLocations = ['/login', '/signup', '/unauthorized', '/api/users/confirm'];


export default function Session(Component) {
  class AuthenticatedComponent extends React.Component {
    componentWillMount() {
      this.props.fetchVersion.trigger();
    }

    componentDidMount() {
      if (!includes(skipLocations, this.props.currentPathname)) {
        this.checkAndRedirect();
      }
    }

    checkAndRedirect() {
      if (this.props.token === undefined) {
        document.title = 'Zeiterfassung medi';
        this.props.changeRoute('/login');
      } else {
        let user = this.props.username;
        if (this.props.firstName && this.props.lastName) {
          user = `${this.props.firstName} ${this.props.lastName}`;
        }
        document.title = `${user} - Zeiterfassung medi`;
      }
    }

    render() {
      return this.props.token ? <Component {...this.props} /> : null;
    }
  }

  AuthenticatedComponent.propTypes = {
    // properties
    token: PropTypes.string,
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    currentPathname: PropTypes.string,
    // actions
    changeRoute: PropTypes.func.isRequired,
    // routines
    fetchVersion: PropTypes.func.isRequired,
  };

  const mapStateToProps = createStructuredSelector({
    token: makeSelectToken(),
    username: makeSelectUsername(),
    firstName: makeSelectFirstName(),
    lastName: makeSelectLastName(),
    currentPathname: makeSelectCurrentPath(),
  });

  function mapDispatchToProps(dispatch) {
    return {
      changeRoute: (url) => dispatch(push(url)),
      ...bindRoutineCreators({ fetchVersion }, dispatch),
    };
  }

  return connect(mapStateToProps, mapDispatchToProps)(AuthenticatedComponent);
}
