/**
*
* SidebarLeft
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import NavigationFirstPageButton from 'material-ui/svg-icons/navigation/first-page';
import muiThemeable from 'material-ui/styles/muiThemeable';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import RowHeader from 'components/RowHeader';

import Wrapper from './Wrapper';


function SidebarLeft(props) {
  const { muiTheme } = props;
  const { toggleSidebarLeft } = props;

  return (
    <ReactCSSTransitionGroup
      transitionName="sidebar"
      transitionEnterTimeout={300}
      transitionLeaveTimeout={300}
      transitionAppear
      transitionAppearTimeout={300}
    >
      <Wrapper muiTheme={muiTheme}>
        <RowHeader
          title="Navigation"
          iconRight={<NavigationFirstPageButton />}
          onIconRightClick={toggleSidebarLeft}
          isSidebar
        />
        {React.Children.toArray(props.children)}
      </Wrapper>
    </ReactCSSTransitionGroup>
  );
}

SidebarLeft.propTypes = {
  // properties
  children: PropTypes.node,
  muiTheme: PropTypes.object.isRequired,
  // actions
  toggleSidebarLeft: PropTypes.func.isRequired,
};

export default muiThemeable()(SidebarLeft);
