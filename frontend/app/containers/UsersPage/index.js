import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { bindRoutineCreators } from 'redux-saga-routines';
import Loader from 'react-loader-advanced';
import { Flex } from 'grid-styled';
import { Card } from 'material-ui/Card';

import Spinner from 'components/Spinner';
import Table from 'components/Table';
import Form from 'containers/Form';
import CardHeader from 'components/CardHeader';
import { adminContext } from 'hocs';

import { USERS_FORM } from './constants';
import { setRenderComponent } from './actions';
import { fetchUsers, editUser } from './routines';
import { makeSelectLoading, makeSelectRenderComponent, makeSelectUsers, makeSelectUser } from './selectors';
import { data, actionButtons } from './dataFormat';
import validate from './validator';
import Wrapper from './Wrapper';

@adminContext
export class UsersPage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  componentWillMount() {
    this.props.fetchUsers.trigger();
  }

  handleCancelButtonClick() {
    this.props.setRenderComponent('table', {});
  }

  renderForm() {
    return (
      <Flex wrap is="section" px={['16px', '150px', '200px', '300px', '400px']} py="16px">
        <Card>
          <CardHeader title={'Benutzer bearbeiten'} />
          <Form
            form={USERS_FORM}
            onSubmit={this.props.editUser}
            formFields={data}
            actionButtons={actionButtons}
            cancel={this.handleCancelButtonClick}
            initialValues={this.props.user}
            validate={validate}
            type={'edit'}
          />
        </Card>
      </Flex>
    );
  }

  renderTable() {
    const users = this.props.users.map((user) => {
      // eslint-disable-next-line no-param-reassign
      user.rolesAsString = user.roles.map((role) => role.name).join(', ');
      return user;
    });

    return (
      <Flex wrap is="section" px={['0px', '16px', '16px', '100px']} py={['0px', '16px']}>
        <Card>
          <Table
            title="Users"
            ressource="User"
            data={users}
            columns={data}
            edit={(user) => this.props.setRenderComponent('form', user)}
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

UsersPage.propTypes = {
  // properties
  loading: PropTypes.bool.isRequired,
  renderComponent: PropTypes.oneOf(['table', 'form']),
  users: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  // actions
  setRenderComponent: PropTypes.func.isRequired,
  // routines
  fetchUsers: PropTypes.func.isRequired,
  editUser: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  renderComponent: makeSelectRenderComponent(),
  users: makeSelectUsers(),
  user: makeSelectUser(),
});

function mapDispatchToProps(dispatch) {
  return {
    setRenderComponent: bindActionCreators(setRenderComponent, dispatch),
    ...bindRoutineCreators({ fetchUsers }, dispatch),
    ...bindRoutineCreators({ editUser }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
