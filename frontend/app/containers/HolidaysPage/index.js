/*
 *
 * HolidaysPage
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
import moment from 'moment';
import Loader from 'react-loader-advanced';
import { orderBy, head } from 'lodash';

import Spinner from 'components/Spinner';
import Table from 'components/Table';
import Form from 'containers/Form';
import CardHeader from 'components/CardHeader';
import { adminContext } from 'hocs';
import { isClosedYear } from 'utils/generic-validators';

import { HOLIDAYS_FORM } from './constants';
import { setRenderComponent, setSelectedYear } from './actions';
import { fetchHolidays, createHoliday, editHoliday, deleteHoliday } from './routines';
import { makeSelectHolidays, makeSelectHoliday, makeSelectRenderComponent, makeSelectSelectedYear, makeSelectLoading } from './selectors';
import { data, actionButtons } from './dataFormat';
import validate from './validator';
import Wrapper from './Wrapper';


@adminContext
export class HolidaysPage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  componentWillMount() {
    this.props.fetchHolidays.trigger();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.selectedYear !== this.props.selectedYear) {
      this.props.fetchHolidays.trigger();
    }
  }

  handleCancelButtonClick() {
    this.props.setRenderComponent('table', {});
  }

  renderTable() {
    return (
      <Flex wrap is="section" px={['0px', '16px', '16px', '100px']} py={['0px', '16px']}>
        <Card>
          <Table
            title="Feiertage"
            ressource="Feiertag"
            data={this.props.holidays}
            columns={data}
            create={() => this.props.setRenderComponent('form', {})}
            edit={(holiday) => this.props.setRenderComponent('form', holiday)}
            delete={this.props.deleteHoliday}
            yearSelect
            onYearSelect={this.props.setSelectedYear}
            selectedYear={this.props.selectedYear}
            disabledAddButton={isClosedYear(this.props.selectedYear)}
          />
        </Card>
      </Flex>
    );
  }

  renderForm() {
    const type = Object.keys(this.props.holiday).length ? 'edit' : 'create';
    const startOfYear = moment().year(this.props.selectedYear).startOf('year').startOf('day').toDate();
    const endOfYear = moment().year(this.props.selectedYear).endOf('year').endOf('day').toDate();

    const latestEntry = head(orderBy(this.props.holidays, 'date', 'desc'));
    const initialValues = fromJS(type === 'edit' ? this.props.holiday : {
      date: (latestEntry && latestEntry.date) || moment().startOf('year').toDate(),
    });
    const customProperties = {
      minDate: startOfYear,
      maxDate: endOfYear,
    };

    return (
      <Flex wrap is="section" px={['16px', '150px', '200px', '300px', '400px']} py="16px">
        <Card>
          <CardHeader title={type === 'edit' ? 'Feiertag bearbeiten' : 'Neuen Feiertag erstellen'} />
          <Form
            form={HOLIDAYS_FORM}
            onSubmit={type === 'edit' ? this.props.editHoliday : this.props.createHoliday}
            formFields={data}
            actionButtons={actionButtons}
            cancel={this.handleCancelButtonClick}
            initialValues={initialValues}
            type={type}
            validate={validate}
            customProperties={customProperties}
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

HolidaysPage.propTypes = {
  // properties
  holidays: PropTypes.array.isRequired,
  holiday: PropTypes.object.isRequired,
  renderComponent: PropTypes.oneOf(['table', 'form']),
  selectedYear: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  // actions
  setRenderComponent: PropTypes.func.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
  // routines
  fetchHolidays: PropTypes.func.isRequired,
  createHoliday: PropTypes.func.isRequired,
  editHoliday: PropTypes.func.isRequired,
  deleteHoliday: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  holidays: makeSelectHolidays(),
  holiday: makeSelectHoliday(),
  renderComponent: makeSelectRenderComponent(),
  selectedYear: makeSelectSelectedYear(),
  loading: makeSelectLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    setRenderComponent: bindActionCreators(setRenderComponent, dispatch),
    setSelectedYear: bindActionCreators(setSelectedYear, dispatch),
    ...bindRoutineCreators({ fetchHolidays }, dispatch),
    ...bindRoutineCreators({ createHoliday }, dispatch),
    ...bindRoutineCreators({ editHoliday }, dispatch),
    ...bindRoutineCreators({ deleteHoliday }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(HolidaysPage);
