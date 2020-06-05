/*
 *
 * TeamDropdown
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';

import { userContext } from 'hocs';
import { impersonate } from 'hocs/Session/routines';

import Wrapper from './Wrapper';
import Team from './Team';


@userContext
export class TeamDropdown extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = { openMenu: false };

    this.handleOpenMenu = this.handleOpenMenu.bind(this);
    this.handleOnRequestChange = this.handleOnRequestChange.bind(this);
    this.handleImpersonate = this.handleImpersonate.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.username !== this.props.username) {
      this.props.changeRoute('/');
    }
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

  handleImpersonate(user) {
    this.props.impersonate.trigger({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
    });
  }

  render() {
    const username = this.props.originUsername || this.props.username;
    const menuItems = [];

    this.props.teams.forEach((team) => {
      const members = team.members.filter((member) => member.username !== username);
      const memberItems = [];

      members.forEach((member) => {
        memberItems.push(
          <MenuItem
            key={`team-nav-item-${team.id}-${member.id}`}
            primaryText={`${member.firstName} ${member.lastName}`}
            onTouchTap={() => this.handleImpersonate(member)}
          />
        );
      });

      menuItems.push(
        <MenuItem
          key={`team-nav-item-${team.id}`}
          primaryText={team.name}
          rightIcon={<ArrowDropRight />}
          menuItems={memberItems}
        />
      );
    });

    return (
      <Wrapper>
        <PeopleIcon />
        <Team onClick={this.handleOpenMenu}>
          <div className="team">
            Teams
          </div>
        </Team>
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
            primaryText="Übersicht"
            onTouchTap={() => this.props.changeRoute('/impersonate')}
          />
          <Divider />
          {menuItems}
        </IconMenu>
      </Wrapper>
    );
  }
}

TeamDropdown.propTypes = {
  // properties
  teams: PropTypes.array,
  username: PropTypes.string,
  originUsername: PropTypes.string,
  // actions
  changeRoute: PropTypes.func.isRequired,
  // routines
  impersonate: PropTypes.func.isRequired,
};


function mapDispatchToProps(dispatch) {
  return {
    ...bindRoutineCreators({ impersonate }, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(TeamDropdown);
