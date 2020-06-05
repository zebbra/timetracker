/*
 *
 * ImpersonatePage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { Flex } from 'grid-styled';
import { Card } from 'material-ui/Card';

import Table from 'components/Table';
import { teamleaderContext } from 'hocs';
import { impersonate } from 'hocs/Session/routines';

import { data } from './dataFormat';
import Wrapper from './Wrapper';


@teamleaderContext
export class ImpersonatePage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.handleImpersonate = this.handleImpersonate.bind(this);
  }

  handleImpersonate(user) {
    this.props.impersonate.trigger(user);
  }

  render() {
    const entries = [];
    const username = this.props.originUsername || this.props.username;
    this.props.teams.forEach((team) => {
      team.members.forEach((member) => {
        if (username !== member.username) {
          entries.push({
            team: team.name,
            firstName: member.firstName,
            lastName: member.lastName,
            username: member.username,
            userId: member.id,
          });
        }
      });
    });

    return (
      <Wrapper>
        <Flex wrap is="section" px={['0px', '16px', '16px', '100px']} py={['0px', '16px']}>
          <Card>
            <Table
              title="Teams"
              ressource="Team"
              data={entries}
              columns={data}
              impersonate={this.handleImpersonate}
            />
          </Card>
        </Flex>
      </Wrapper>
    );
  }
}

ImpersonatePage.propTypes = {
  // properties
  teams: PropTypes.array,
  username: PropTypes.string,
  originUsername: PropTypes.string,
  // routines
  impersonate: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindRoutineCreators({ impersonate }, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(ImpersonatePage);
