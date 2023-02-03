/*
 *
 * ReportsPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { createStructuredSelector } from 'reselect';
import Loader from 'react-loader-advanced';
import moment from 'moment-timezone';

import Alert from 'components/Alert';
import Spinner from 'components/Spinner';
import RowHeader from 'components/RowHeader';
import { togglePrinting } from 'containers/App/actions';
import { makeSelectOnboarded, makeSelectPrinting } from 'containers/App/selectors';
import { userContext } from 'hocs';
import { isClosedYear } from 'utils/generic-validators';
import { asPdfWrapper, exportToCsv } from 'utils/generic-helpers';

import { setComponent, setSelectedYear } from './actions';
import { fetchAllTimeData, fetchAllElementsData, submitManualCorrection } from './routines';
import makeSelectReportsPage, { makeSelectTimeseries } from './selectors';
import TimeTab from './TimeTab';
import ElementsTab from './ElementsTab';
import ExportTab from './ExportTab';
import Table from './Table';


@userContext
export class ReportsPage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.renderTimeTab = this.renderTimeTab.bind(this);
    this.renderElementsTab = this.renderElementsTab.bind(this);
    this.handleOnDownloadIconClick = this.handleOnDownloadIconClick.bind(this);
  }

  componentWillMount() {
    if (this.props.printing) {
      this.props.togglePrinting();
    }

    if (this.props.Reports.component === 'time') {
      this.props.fetchAllTimeData.trigger();
    } else if (this.props.Reports.component === 'elements') {
      this.props.fetchAllElementsData.trigger();
    }
  }

  componentWillReceiveProps(nextProps) {
    const thisComponent = this.props.Reports.component;
    const nextComponent = nextProps.Reports.component;
    const thisSelectedYear = this.props.Reports.selectedYear;
    const nextSelectedYear = nextProps.Reports.selectedYear;

    if (nextComponent === 'time') {
      if (thisComponent !== 'time' || thisSelectedYear !== nextSelectedYear) {
        this.props.fetchAllTimeData.trigger();
      }
    } else if (nextComponent === 'elements') {
      if (thisComponent !== 'elements' || thisSelectedYear !== nextSelectedYear) {
        this.props.fetchAllElementsData.trigger();
      }
    }
  }

  handleOnDownloadIconClick(format) {
    const filename = `Element-Report ${this.props.firstName} ${this.props.lastName}`;

    if (format === 'csv') {
      const emptyRow = [null, null, null, null, null];

      const timeRange = moment().year() === this.props.Reports.selectedYear
        ? `${moment().startOf('year').format('dd DD. MMM')} - ${moment().format('dd DD. MMM Y')}`
        : `${moment().year(this.props.Reports.selectedYear).startOf('year').format('dd DD. MMM')} - ${moment().year(this.props.Reports.selectedYear).endOf('year').format('dd DD. MMM Y')}`;

      const title = `${filename} / ${timeRange}`;
      const rows = [[title, null, null, null, null]];

      this.props.Reports.data.forEach((section) => {
        rows.push(emptyRow);
        rows.push([section.title, 'Soll [L]', 'Soll [h]', 'Ist [h]', 'Saldo']);
        section.data.forEach((data) => {
          rows.push([
            data[0],
            data[1] === null ? '' : data[1].toFixed(2),
            data[2] === null ? '' : data[2].toFixed(2),
            data[3] === null ? '' : data[3].toFixed(2),
            ((data[2] * -1) + data[3]).toFixed(2),
          ]);
        });
      });
      exportToCsv(filename, rows);
    } else {
      asPdfWrapper(this.props.togglePrinting, filename);
    }
  }

  renderTimeTab() {
    return (
      <TimeTab
        indicators={this.props.Reports.indicators}
        timeseries={this.props.timeseries}
        selectedYear={this.props.Reports.selectedYear}
      />
    );
  }

  renderElementsTab() {
    if (this.props.printing) {
      return (
        <Table
          data={this.props.Reports.data}
          selectedYear={this.props.Reports.selectedYear}
          firstName={this.props.firstName}
          lastName={this.props.lastName}
        />
      );
    }

    const isClosed = isClosedYear(this.props.Reports.selectedYear);
    return (
      <ElementsTab
        data={this.props.Reports.data}
        isClosed={isClosed}
        profile={this.props.Reports.profile}
        submitManualCorrection={this.props.submitManualCorrection}
        firstName={this.props.firstName}
        lastName={this.props.lastName}
      />
    );
  }

  renderExportTab() {
    return (
      <ExportTab />
    );
  }

  render() {
    const tabs = [
      { label: 'Zeit', value: 'time', handleOnActive: () => this.props.setComponent({ component: 'time' }) },
      { label: 'Elemente', value: 'elements', handleOnActive: () => this.props.setComponent({ component: 'elements' }) },
      { label: 'Export', value: 'export', handleOnActive: () => this.props.setComponent({ component: 'export' }) },
    ];
    const hasDownloadIcon = this.props.Reports.component === 'elements';

    return (
      <Loader
        show={this.props.Reports.loading}
        message={<Spinner />}
        contentBlur={0.5}
        backgroundStyle={{ backgroundColor: 'rgab(255,255,255,0.4)' }}
      >
        { <RowHeader
          title="Einstellungen"
          tabs={tabs}
          tabsValue={this.props.Reports.component}
          selectedYear={this.props.Reports.selectedYear}
          selectableYears={this.props.Reports.component === 'export' ? 0 : moment().year() - moment().year(2018).year()}
          onYearSelect={this.props.setSelectedYear}
          hasDownloadIcon={hasDownloadIcon}
          downloadFormats={['pdf', 'csv']}
          onDownloadIconClick={this.handleOnDownloadIconClick}
        /> }
        { !this.props.onboarded &&
          <Alert
            msg="Bitte hinterlege ein Arbeitspensum in deinen Einstellungen"
            type="info"
            time={0}
          />
        }
        <div>
          { this.props.Reports.component === 'time' ? this.renderTimeTab() : null }
          { this.props.Reports.component === 'elements' ? this.renderElementsTab() : null }
          { this.props.Reports.component === 'export' ? this.renderExportTab() : null }
        </div>
      </Loader>
    );
  }
}

ReportsPage.propTypes = {
  // properties
  Reports: PropTypes.shape({
    component: PropTypes.oneOf(['time', 'elements', 'export']),
    selectedYear: PropTypes.number.isRequired,
    loading: PropTypes.bool.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      unit: PropTypes.string.isRequired,
      actual: PropTypes.number.isRequired,
      target: PropTypes.number.isRequired,
      saldo: PropTypes.number.isRequired,
    })).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      order: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      data: PropTypes.array.isRequired,
    })).isRequired,
    profile: PropTypes.string,
  }).isRequired,
  timeseries: PropTypes.array.isRequired,
  onboarded: PropTypes.bool,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  printing: PropTypes.bool.isRequired,
  // actions
  setComponent: PropTypes.func.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
  togglePrinting: PropTypes.func.isRequired,
  // routines
  fetchAllTimeData: PropTypes.func.isRequired,
  fetchAllElementsData: PropTypes.func.isRequired,
  submitManualCorrection: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  Reports: makeSelectReportsPage(),
  timeseries: makeSelectTimeseries(),
  onboarded: makeSelectOnboarded(),
  printing: makeSelectPrinting(),
});

function mapDispatchToProps(dispatch) {
  return {
    setComponent: bindActionCreators(setComponent, dispatch),
    setSelectedYear: bindActionCreators(setSelectedYear, dispatch),
    togglePrinting: bindActionCreators(togglePrinting, dispatch),
    ...bindRoutineCreators({ fetchAllTimeData }, dispatch),
    ...bindRoutineCreators({ fetchAllElementsData }, dispatch),
    ...bindRoutineCreators({ submitManualCorrection }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportsPage);
