/**
*
* SidebarRight
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import muiThemeable from 'material-ui/styles/muiThemeable';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Sticky from 'react-sticky-el';

import RowHeader from 'components/RowHeader';
import * as Settings from 'containers/Settings';

import Wrapper from './Wrapper';


export class SidebarRight extends React.PureComponent {

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const SettingComponent = Settings[this.props.name];

    return (
      <ReactCSSTransitionGroup
        transitionName="sidebar"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
        transitionAppear
        transitionAppearTimeout={300}
      >
        <Wrapper muiTheme={this.props.muiTheme} className="sidebarRightWrapper">
          <Sticky scrollElement=".sidebarRightWrapper" stickyStyle={{ zIndex: 1 }} >
            <RowHeader
              title="Einstellungen"
              iconRight={<SettingsIcon />}
              onIconRightClick={() => this.props.toggleSidebarRight()}
              isSidebar
            />
          </Sticky>
          <SettingComponent />
        </Wrapper>
      </ReactCSSTransitionGroup>
    );
  }
}

SidebarRight.propTypes = {
  // properties
  name: PropTypes.string.isRequired,
  muiTheme: PropTypes.object.isRequired,
  // actions
  toggleSidebarRight: PropTypes.func.isRequired,
};

export default muiThemeable()(SidebarRight);
