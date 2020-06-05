/**
*
* Navigation
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import Subheader from 'material-ui/Subheader';
import muiThemeable from 'material-ui/styles/muiThemeable';

import MobileItem from './MobileItem';
import DesktopItem from './DesktopItem';
import { userLinks, adminLinks } from './Links';

export class Navigation extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { currentPath, isMobile, isAdmin, muiTheme } = this.props;
    const { changeRoute } = this.props;

    const navItems = [];
    let links = [];
    if (isAdmin) {
      links = adminLinks;
    } else {
      links = userLinks;
    }

    if (isMobile) {
      links.forEach((link) => {
        navItems.push(
          <MobileItem key={`nav-item-${link.label}`} className={(currentPath === link.path) ? 'active' : ''} muiTheme={muiTheme}>
            { link.external ?
              <Subheader><a href={link.path} target="_blank">{link.label}</a></Subheader>
              :
              <Subheader onTouchTap={() => changeRoute(link.path)}>{link.label}</Subheader>
            }
          </MobileItem>
        );
      });
    } else {
      links.forEach((link) => {
        navItems.push(
          <DesktopItem key={`nav-item-${link.label}`} className={(currentPath === link.path) ? 'active' : ''} muiTheme={muiTheme}>
            { link.external ?
              <a href={link.path} target="_blank" style={{ textDecoration: 'none' }}>{link.label}</a>
              :
              <section onTouchTap={() => changeRoute(link.path)}>{link.label}</section>
            }
          </DesktopItem>
        );
      });
    }

    return (
      <section>{navItems}</section>
    );
  }
}

Navigation.propTypes = {
  // properties
  currentPath: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
  isAdmin: PropTypes.bool.isRequired,
  muiTheme: PropTypes.object.isRequired,
  // actions
  changeRoute: PropTypes.func.isRequired,
};

export default muiThemeable()(Navigation);
