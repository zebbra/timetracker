/*
 *
 * TeamsPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { createStructuredSelector } from 'reselect';
import { fromJS } from 'immutable';
import { Flex } from 'grid-styled';
import { Card } from 'material-ui/Card';
import Loader from 'react-loader-advanced';
import { find } from 'lodash';

import Spinner from 'components/Spinner';
import Table from 'components/Table';
import Form from 'containers/Form';
import CardHeader from 'components/CardHeader';
import { adminContext } from 'hocs';

import { TEAMS_FORM } from './constants';
import { setRenderComponent } from './actions';
import { fetchTeams, createTeam, editTeam, deleteTeam } from './routines';
import { makeSelectUsers, makeSelectAllTeams, makeSelectTeam, makeSelectRenderComponent, makeSelectLoading } from './selectors';
import validate from './validator';
import { data, actionButtons } from './dataFormat';
import Wrapper from './Wrapper';


@adminContext
export class TeamsPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);

    this.state = {
      leadersValue: [],
      membersValue: [],
    };

    this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  componentWillMount() {
    this.props.fetchTeams.trigger();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allTeams.length && nextProps.renderComponent === 'form') {
      const team = find(nextProps.allTeams, { id: nextProps.team.id });
      if (team) {
        this.setState({
          leadersValue: team.members && team.members.filter((member) =>
            member.memberships && find(member.memberships, { isTeamleader: true, teamId: team.id })
          ).map((member) => ({ value: member.id, label: `${member.firstName} ${member.lastName}` })),
          membersValue: team.members && team.members.filter((member) =>
            member.memberships && !find(member.memberships, { isTeamleader: true, teamId: team.id })
          ).map((member) => ({ value: member.id, label: `${member.firstName} ${member.lastName}` })),
        });
      } else {
        this.setState({
          leadersValue: [],
          membersValue: [],
        });
      }
    }
  }

  handleCancelButtonClick() {
    this.props.setRenderComponent('table', {});
  }

  renderTable() {
    const allTeams = this.props.allTeams.map((team) => {
      const leaders = team.members && team.members.filter((leader) =>
        leader.memberships && find(leader.memberships, { isTeamleader: true, teamId: team.id })
      ).map((leader) => `${leader.firstName} ${leader.lastName}`);

      const members = team.members && team.members.filter((member) =>
        member.memberships && !find(member.memberships, { isTeamleader: true, teamId: team.id })
      ).map((member) => `${member.firstName} ${member.lastName}`);

      return {
        id: team.id,
        name: team.name,
        leaders,
        tooltipLeaders: `<ul>${leaders.map((leader) => `<li>${leader}</li>`).join('')}</ul>`,
        members,
        tooltipMembers: `<ul>${members.map((member) => `<li>${member}</li>`).join('')}</ul>`,
      };
    });

    return (
      <Flex wrap is="section" px={['0px', '16px', '16px', '100px']} py={['0px', '16px']}>
        <Card>
          <Table
            title="Teams"
            ressource="Team"
            data={allTeams}
            columns={data}
            create={() => this.props.setRenderComponent('form', {})}
            edit={(team) => this.props.setRenderComponent('form', team)}
            delete={this.props.deleteTeam}
          />
        </Card>
      </Flex>
    );
  }

  renderForm() {
    const type = Object.keys(this.props.team).length ? 'edit' : 'create';

    const onLeadersChange = (value) => this.setState({ leadersValue: value });
    const onMembersChange = (value) => this.setState({ membersValue: value });

    const selectableUsers = this.props.users.filter((user) => (
      !find(this.state.leadersValue, { value: user.id }) && !find(this.state.membersValue, { value: user.id })
    ));

    const leadersOptions = selectableUsers.map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} - ${user.email}`,
    }));

    const membersOptions = selectableUsers.map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} - ${user.email}`,
    }));

    const initialValues = fromJS(type === 'edit' ? Object.assign(this.props.team, {
      leaders: this.state.leadersValue,
      members: this.state.membersValue,
    }) : {});

    return (
      <Flex wrap is="section" px={['16px', '150px', '200px', '300px', '400px']} py="16px">
        <Card>
          <CardHeader title={type === 'edit' ? 'Team bearbeiten' : 'Neues Team erstellen'} />
          <Form
            form={TEAMS_FORM}
            onSubmit={type === 'edit' ? this.props.editTeam : this.props.createTeam}
            formFields={data}
            actionButtons={actionButtons}
            cancel={this.handleCancelButtonClick}
            initialValues={initialValues}
            validate={validate}
            type={type}
            customProperties={{
              leaders: { value: this.state.leadersValue, options: leadersOptions, onChange: onLeadersChange },
              members: { value: this.state.membersValue, options: membersOptions, onChange: onMembersChange },
            }}
          />
        </Card>
      </Flex>
    );
  }

  render() {
    return (
      <Loader
        show={this.props.loading}
        message={<Spinner />}
        contentBlur={0.5}
        backgroundStyle={{ backgroundColor: 'rgab(255,255,255,0.4)' }}
      >
        <Wrapper>
          { this.props.renderComponent === 'table' ? this.renderTable() : this.renderForm() }
        </Wrapper>
      </Loader>
    );
  }
}

TeamsPage.propTypes = {
  // properties
  team: PropTypes.object.isRequired,
  allTeams: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  renderComponent: PropTypes.oneOf(['table', 'form']),
  loading: PropTypes.bool.isRequired,
  // actions
  setRenderComponent: PropTypes.func.isRequired,
  // routines
  fetchTeams: PropTypes.func.isRequired,
  createTeam: PropTypes.func.isRequired,
  editTeam: PropTypes.func.isRequired,
  deleteTeam: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  team: makeSelectTeam(),
  allTeams: makeSelectAllTeams(),
  users: makeSelectUsers(),
  renderComponent: makeSelectRenderComponent(),
  loading: makeSelectLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    setRenderComponent: bindActionCreators(setRenderComponent, dispatch),
    ...bindRoutineCreators({ fetchTeams }, dispatch),
    ...bindRoutineCreators({ createTeam }, dispatch),
    ...bindRoutineCreators({ editTeam }, dispatch),
    ...bindRoutineCreators({ deleteTeam }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamsPage);
