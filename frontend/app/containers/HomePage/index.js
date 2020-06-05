/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { currentUser } from 'hocs';


@currentUser
export class HomePage extends React.PureComponent {

  // redirect to time page as we do not have a home page
  componentWillMount() {
    if (this.props.isAdmin) {
      this.props.changeRoute('/elements');
    } else if (this.props.isUser) {
      this.props.changeRoute('/time');
    } else {
      this.props.changeRoute('/login');
    }
  }

  render() {
    return <div />;
  }
}

HomePage.propTypes = {
  // properties
  isUser: PropTypes.bool,
  isAdmin: PropTypes.bool,
  // actions
  changeRoute: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    changeRoute: (url) => dispatch(push(url)),
  };
}

export default connect(null, mapDispatchToProps)(HomePage);
