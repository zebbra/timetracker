/*
 *
 * ElementsPage
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

import Spinner from 'components/Spinner';
import Table from 'components/Table';
import Form from 'containers/Form';
import CardHeader from 'components/CardHeader';
import { adminContext } from 'hocs';

import { ELEMENTS_FORM } from './constants';
import { setRenderComponent } from './actions';
import { fetchElements, createElement, editElement, deleteElement } from './routines';
import { makeSelectElements, makeSelectElement, makeSelectRenderComponent, makeSelectLoading } from './selectors';
import validate from './validator';
import { data, actionButtons } from './dataFormat';
import Wrapper from './Wrapper';


@adminContext
export class ElementsPage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  componentWillMount() {
    this.props.fetchElements.trigger();
  }

  handleCancelButtonClick() {
    this.props.setRenderComponent('table', {});
  }

  renderTable() {
    return (
      <Flex wrap is="section" px={['0px', '16px', '16px', '100px']} py={['0px', '16px']}>
        <Card>
          <Table
            title="Leistungselemente"
            ressource="Leistungselement"
            data={this.props.elements}
            columns={data}
            create={() => this.props.setRenderComponent('form', {})}
            edit={(element) => this.props.setRenderComponent('form', element)}
            delete={this.props.deleteElement}
          />
        </Card>
      </Flex>
    );
  }

  renderForm() {
    const type = Object.keys(this.props.element).length ? 'edit' : 'create';
    const initialValues = fromJS(type === 'edit' ? this.props.element : {
      unit: 'l',
      start: new Date(),
      factor: 1,
    });

    return (
      <Flex wrap is="section" px={['16px', '150px', '200px', '300px', '400px']} py="16px">
        <Card>
          <CardHeader title={type === 'edit' ? 'Leistungselement bearbeiten' : 'Neues Leistungselement erstellen'} />
          <Form
            form={ELEMENTS_FORM}
            onSubmit={type === 'edit' ? this.props.editElement : this.props.createElement}
            formFields={data}
            actionButtons={actionButtons}
            cancel={this.handleCancelButtonClick}
            initialValues={initialValues}
            validate={validate}
            type={type}
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

ElementsPage.propTypes = {
  // properties
  element: PropTypes.object.isRequired,
  elements: PropTypes.array.isRequired,
  renderComponent: PropTypes.oneOf(['table', 'form']),
  loading: PropTypes.bool.isRequired,
  // actions
  setRenderComponent: PropTypes.func.isRequired,
  // routines
  fetchElements: PropTypes.func.isRequired,
  createElement: PropTypes.func.isRequired,
  editElement: PropTypes.func.isRequired,
  deleteElement: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  element: makeSelectElement(),
  elements: makeSelectElements(),
  renderComponent: makeSelectRenderComponent(),
  loading: makeSelectLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    setRenderComponent: bindActionCreators(setRenderComponent, dispatch),
    ...bindRoutineCreators({ fetchElements }, dispatch),
    ...bindRoutineCreators({ createElement }, dispatch),
    ...bindRoutineCreators({ editElement }, dispatch),
    ...bindRoutineCreators({ deleteElement }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ElementsPage);
