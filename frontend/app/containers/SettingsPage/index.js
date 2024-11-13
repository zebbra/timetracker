/*
 *
 * SettingsPage
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
import { groupBy, sortBy } from 'lodash';

import Alert from 'components/Alert';
import Spinner from 'components/Spinner';
import RowHeader from 'components/RowHeader';
import { togglePrinting } from 'containers/App/actions';
import { makeSelectOnboarded, makeSelectPrinting } from 'containers/App/selectors';
import { isClosedYear } from 'utils/generic-validators';
import { userContext } from 'hocs';
import { asPdfWrapper, exportToCsv } from 'utils/generic-helpers';

import { setComponent, setSelectedYear } from './actions';
import { fetchAllEmploymentData, fetchAllElementsData, submitProfile, submitElement, createEmployment, editEmployment, deleteEmployment } from './routines';
import makeSelectSettingsPage from './selectors';
import EmploymentTab from './EmploymentTab';
import ElementsTab from './ElementsTab';
import TableElements from './TableElements';
import TableEmployment from './TableEmployment';


@userContext
export class SettingsPage extends React.PureComponent {

  constructor(props) {
    super(props);

    this.renderEmploymentTab = this.renderEmploymentTab.bind(this);
    this.renderElementsTab = this.renderElementsTab.bind(this);
    this.handleOnDownloadIconClick = this.handleOnDownloadIconClick.bind(this);
  }

  componentWillMount() {
    if (this.props.printing) {
      this.props.togglePrinting();
    }

    if (this.props.Settings.component === 'employment') {
      this.props.fetchAllEmploymentData.trigger();
    } else if (this.props.Settings.component === 'elements') {
      this.props.fetchAllElementsData.trigger();
    }
  }

  componentWillReceiveProps(nextProps) {
    const thisComponent = this.props.Settings.component;
    const nextComponent = nextProps.Settings.component;
    const thisSelectedYear = this.props.Settings.selectedYear;
    const nextSelectedYear = nextProps.Settings.selectedYear;

    if (nextComponent === 'employment') {
      if (thisComponent !== 'employment' || thisSelectedYear !== nextSelectedYear) {
        this.props.fetchAllEmploymentData.trigger();
      }
    } else if (nextComponent === 'elements') {
      if (thisComponent !== 'elements' || thisSelectedYear !== nextSelectedYear) {
        this.props.fetchAllElementsData.trigger();
      }
    }
  }

  handleOnDownloadIconClick(format) {
    const prefix = this.props.Settings.component === 'employment' ? 'Anstellung' : 'Leistungselemente';
    const filename = `${prefix} ${this.props.firstName} ${this.props.lastName}`;
    const rows = [];

    if (format === 'csv') {
      const title = `${filename} / ${this.props.Settings.selectedYear}`;

      if (this.props.Settings.component === 'employment') {
        const emptyRow = [null, null, null];
        rows.push([title, null, null]);
        rows.push(emptyRow);
        rows.push(['Arbeitspensum', 'Von', 'Bis']);
        this.props.Settings.employments.forEach((employment) => {
          const hours = ((employment.scope / 100) * 8.4).toFixed(2);
          rows.push([
            `${employment.scope}% (${hours}h)`,
            moment(employment.start).format('DD.MM.YYYY'),
            employment.end ? moment(employment.end).format('DD.MM.YYYY') : 'unbefristed',
          ]);
        });

        rows.push(emptyRow);
        rows.push(['Geplante Abwesenheiten', 'Tage', 'Stunden']);
        rows.push(['Ferien', this.props.Settings.profile.plannedVacations.toFixed(2), null]);
        rows.push(['Militär, Mutterschaft und Diverses', this.props.Settings.profile.plannedMixed.toFixed(2), null]);
        rows.push(['Bewilligte Nachqual.', null, this.props.Settings.profile.plannedQuali.toFixed(2)]);

        if (this.props.Settings.selectedYear > 2024) {
          rows.push(['Treueprämien', null, this.props.Settings.profile.plannedPremiums.toFixed(2)]);
        } else {
          rows.push(['Treueprämien', this.props.Settings.profile.plannedPremiums.toFixed(2), null]);
        }

        rows.push(emptyRow);
        rows.push(['Überträge aus dem Vorjahr', 'Tage', 'Stunden']);
        rows.push(['Totale Jahresarbeitszeit letztes Jahr', null, this.props.Settings.profile.transferTotalLastYear.toFixed(2)]);
        rows.push(['Überzeit (maximum 1%)', null, this.props.Settings.profile.transferOvertime.toFixed(2)]);
        rows.push(['bewilligte Ferien', this.props.Settings.profile.transferGrantedVacations.toFixed(2), null]);
        rows.push(['bewilligte Überzeit (1% übersteigend)', null, this.props.Settings.profile.transferGrantedOvertime.toFixed(2)]);
      } else {
        const emptyRow = [null, null, null, null];
        rows.push([title, null, null, null]);

        const groupedRecords = groupBy(this.props.Settings.elements.filter((e) => e.project !== 'Default'), 'project');
        Object.keys(groupedRecords).forEach((projectName) => {
          rows.push(emptyRow);
          rows.push([projectName, 'Soll [L]', 'Soll [h]', 'Ist [h]']);

          sortBy(groupedRecords[projectName], 'label').forEach((element) => {
            const targetL = element.setpoint && element.setpoint.value && element.unit === 'l' ? element.setpoint.value.toFixed(2) || '0.00' : '';
            const targetH = element.setpoint && element.setpoint.value ? (element.factor * element.setpoint.value).toFixed(2) : '';
            rows.push([
              element.label,
              targetL,
              targetH,
              element.actual,
            ]);
          });
        });
      }

      exportToCsv(filename, rows);
    } else {
      asPdfWrapper(this.props.togglePrinting, filename);
    }
  }

  renderEmploymentTab() {
    if (this.props.printing) {
      return (
        <TableEmployment
          employments={this.props.Settings.employments}
          profile={this.props.Settings.profile}
          selectedYear={this.props.Settings.selectedYear}
          firstName={this.props.firstName}
          lastName={this.props.lastName}
        />
      );
    }

    const isClosed = this.props.Settings.profile.closed || isClosedYear(this.props.Settings.selectedYear);

    return (
      <EmploymentTab
        isClosed={isClosed}
        employments={this.props.Settings.employments}
        profile={this.props.Settings.profile}
        submitProfile={this.props.submitProfile}
        renderComponent={this.props.Settings.component}
        setComponent={this.props.setComponent}
        record={this.props.Settings.record}
        createEmployment={this.props.createEmployment}
        editEmployment={this.props.editEmployment}
        deleteEmployment={this.props.deleteEmployment}
        isImpersonated={this.props.isImpersonated}
        isTeamleader={this.props.isTeamleader}
        selectedYear={this.props.Settings.selectedYear}
      />
    );
  }

  renderElementsTab() {
    if (this.props.printing) {
      return (
        <TableElements
          elements={this.props.Settings.elements}
          selectedYear={this.props.Settings.selectedYear}
          firstName={this.props.firstName}
          lastName={this.props.lastName}
        />
      );
    }

    const isClosed = isClosedYear(this.props.Settings.selectedYear);
    return (
      <ElementsTab
        isClosed={isClosed}
        selectedYear={this.props.Settings.selectedYear}
        elements={this.props.Settings.elements}
        submitElement={this.props.submitElement}
        isImpersonated={this.props.isImpersonated}
      />
    );
  }

  render() {
    const tabs = [
      { label: 'Anstellung', value: 'employment', handleOnActive: () => this.props.setComponent({ component: 'employment', record: {} }) },
      { label: 'Leistungselemente', value: 'elements', handleOnActive: () => this.props.setComponent({ component: 'elements', record: {} }) },
    ];


    const hasDownloadIcon = this.props.Settings.component !== 'form';

    return (
      <Loader
        show={this.props.Settings.loading}
        message={<Spinner />}
        contentBlur={0.5}
        backgroundStyle={{ backgroundColor: 'rgab(255,255,255,0.4)' }}
      >
        { <RowHeader
          title="Einstellungen"
          tabs={tabs}
          tabsValue={this.props.Settings.component}
          selectedYear={this.props.Settings.selectedYear}
          selectableYears={moment().year() - moment().year(2018).year()}
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
          { this.props.Settings.component === 'employment' ? this.renderEmploymentTab() : null }
          { this.props.Settings.component === 'form' ? this.renderEmploymentTab() : null }
          { this.props.Settings.component === 'elements' ? this.renderElementsTab() : null }
        </div>
      </Loader>
    );
  }
}

SettingsPage.defaultProps = {
  isTeamleader: false,
};

SettingsPage.propTypes = {
  // properties
  Settings: PropTypes.shape({
    component: PropTypes.oneOf(['employment', 'elements', 'form']),
    elements: PropTypes.array.isRequired,
    employments: PropTypes.array.isRequired,
    selectedYear: PropTypes.number.isRequired,
    profile: PropTypes.shape({
      plannedVacations: PropTypes.number.isRequired,
      plannedMixed: PropTypes.number.isRequired,
      plannedQuali: PropTypes.number.isRequired,
      plannedPremiums: PropTypes.number.isRequired,
      transferTotalLastYear: PropTypes.number.isRequired,
      transferOvertime: PropTypes.number.isRequired,
      transferGrantedVacations: PropTypes.number.isRequired,
      transferGrantedOvertime: PropTypes.number.isRequired,
      closed: PropTypes.bool.isRequired,
    }).isRequired,
    record: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  isImpersonated: PropTypes.bool,
  isTeamleader: PropTypes.bool.isRequired,
  onboarded: PropTypes.bool,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  printing: PropTypes.bool.isRequired,
  // actions
  setComponent: PropTypes.func.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
  togglePrinting: PropTypes.func.isRequired,
  // routines
  fetchAllEmploymentData: PropTypes.func.isRequired,
  fetchAllElementsData: PropTypes.func.isRequired,
  submitProfile: PropTypes.func.isRequired,
  submitElement: PropTypes.func.isRequired,
  createEmployment: PropTypes.func.isRequired,
  editEmployment: PropTypes.func.isRequired,
  deleteEmployment: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  Settings: makeSelectSettingsPage(),
  onboarded: makeSelectOnboarded(),
  printing: makeSelectPrinting(),
});

function mapDispatchToProps(dispatch) {
  return {
    setComponent: bindActionCreators(setComponent, dispatch),
    setSelectedYear: bindActionCreators(setSelectedYear, dispatch),
    togglePrinting: bindActionCreators(togglePrinting, dispatch),
    ...bindRoutineCreators({ fetchAllEmploymentData }, dispatch),
    ...bindRoutineCreators({ fetchAllElementsData }, dispatch),
    ...bindRoutineCreators({ submitProfile }, dispatch),
    ...bindRoutineCreators({ submitElement }, dispatch),
    ...bindRoutineCreators({ createEmployment }, dispatch),
    ...bindRoutineCreators({ editEmployment }, dispatch),
    ...bindRoutineCreators({ deleteEmployment }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsPage);
