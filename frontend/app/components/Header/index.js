/**
*
* Header
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import NavigationMenuButton from 'material-ui/svg-icons/navigation/menu';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import muiThemeable from 'material-ui/styles/muiThemeable';
import ProfileIcon from 'material-ui/svg-icons/social/person';
import LogoutIcon from 'material-ui/svg-icons/action/exit-to-app';
import ChangeHistoryIcon from 'material-ui/svg-icons/action/change-history';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import HelpIcon from 'material-ui/svg-icons/action/help-outline';

import Navigation from 'components/Navigation';
import TeamDropdown from 'containers/TeamDropdown';

import Wrapper from './Wrapper';
import MobileIcon from './MobileIcon';
import Title from './Title';
import User from './User';


export class Header extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { openMenu: false };

    this.handleOpenMenu = this.handleOpenMenu.bind(this);
    this.handleOnRequestChange = this.handleOnRequestChange.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const currentPathChanged = this.props.currentPath !== nextProps.currentPath;
    const menuStateChanged = this.state.openMenu !== nextState.openMenu;

    return currentPathChanged || menuStateChanged;
  }

  handleOpenMenu = () => {
    this.setState({
      openMenu: true,
    });
  }

  handleOnRequestChange = (value) => {
    this.setState({
      openMenu: value,
    });
  }

  render() {
    const { isTeamleader, isAdmin, isSuperAdmin, username } = this.props;

    return (
      <header>
        <Toolbar>
          <ToolbarGroup firstChild>
            <MobileIcon touch>
              <NavigationMenuButton onTouchTap={this.props.toggleSidebarLeft} />
            </MobileIcon>
            <Title
              onTouchTap={() => this.props.changeRoute('/')}
              style={{ color: this.props.muiTheme.palette.accent1Color }}
              text="Zeiterfassung-medi"
            />
          </ToolbarGroup>
          <ToolbarGroup lastChild>
            <Navigation
              changeRoute={this.props.changeRoute}
              currentPath={this.props.currentPath}
              isAdmin={isAdmin}
            />
            { isTeamleader &&
              <TeamDropdown
                changeRoute={this.props.changeRoute}
                location={this.props.location}
              />
            }
            <Wrapper>
              <ProfileIcon />
              <User onClick={this.handleOpenMenu}>
                <div className="username">
                  {username}
                </div>
              </User>
              <IconMenu
                iconButtonElement={
                  <IconButton touch>
                    <NavigationExpandMoreIcon />
                  </IconButton>
                }
                open={this.state.openMenu}
                onRequestChange={this.handleOnRequestChange}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  primaryText="Aktualisieren"
                  leftIcon={<RefreshIcon />}
                  onTouchTap={this.props.reloadAndUpdateVersion}
                />
                { !isAdmin &&
                  <MenuItem
                    primaryText="Profil"
                    leftIcon={<ProfileIcon />}
                    onTouchTap={() => this.props.changeRoute('/profile')}
                  />
                }
                { isSuperAdmin &&
                  <MenuItem
                    primaryText="Audits"
                    leftIcon={<ChangeHistoryIcon />}
                    onTouchTap={() => this.props.changeRoute('/audits')}
                  />
                }
                <MenuItem
                  primaryText="Hilfe"
                  leftIcon={<HelpIcon />}
                  href="https://www.youtube.com/playlist?list=PLcekKu9NqG7HvtWnQ-UVK8-JBmbuTwlnZ"
                  target="_blank"
                />
                <MenuItem
                  primaryText="Abmelden"
                  leftIcon={<LogoutIcon />}
                  onTouchTap={() => this.props.deleteSession()}
                />
                <MenuItem
                  primaryText={`Version ${this.props.version}`}
                  onTouchTap={() => this.props.changeRoute('/updates')}
                />
              </IconMenu>
            </Wrapper>
          </ToolbarGroup>
        </Toolbar>
      </header>
    );
  }
}

Header.propTypes = {
  // properties
  isTeamleader: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSuperAdmin: PropTypes.bool,
  username: PropTypes.string,
  currentPath: PropTypes.string.isRequired,
  muiTheme: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  version: PropTypes.string.isRequired,
  // actions
  toggleSidebarLeft: PropTypes.func.isRequired,
  changeRoute: PropTypes.func.isRequired,
  deleteSession: PropTypes.func.isRequired,
  reloadAndUpdateVersion: PropTypes.func.isRequired,
};

export default muiThemeable()(Header);
