/**
*
* EmploymentTab
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import { Card } from 'material-ui/Card';
import { fromJS } from 'immutable';
import moment from 'moment';
import Dialog from 'material-ui/Dialog';

import ActionButton from 'components/ActionButton';
import EditableList from 'components/EditableList';
import CardHeader from 'components/CardHeader';
import Form from 'containers/Form';

import { EMPLOYMENT_FORM } from './constants';
import validate, { validateEmployment } from './validator';
import { data, actionButtons } from './dataFormat';


export class EmploymentTab extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.toggleDialog = this.toggleDialog.bind(this);
    this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.renderTab = this.renderTab.bind(this);
  }

  toggleDialog(record, remove) {
    if (remove) {
      this.setState({ open: !this.state.open });
      this.props.deleteEmployment(this.state.record);
    } else {
      this.setState({
        open: !this.state.open,
        record,
      });
    }
  }

  handleCancelButtonClick() {
    this.props.setComponent({ component: 'employment', record: {} });
  }

  renderForm() {
    const type = Object.keys(this.props.record).length ? 'edit' : 'create';
    const initialValues = fromJS(type === 'edit' ? this.props.record : {
      start: new Date(),
    });

    return (
      <Flex wrap is="section" px={['16px', '150px', '200px', '300px', '400px']} py="16px">
        <Card style={{ width: '100%' }}>
          <CardHeader title={type === 'edit' ? 'Arbeitspensum bearbeiten' : 'Neues Arbeitspensum erstellen'} />
          <Form
            form={EMPLOYMENT_FORM}
            onSubmit={type === 'edit' ? this.props.editEmployment : this.props.createEmployment}
            formFields={data}
            actionButtons={actionButtons}
            cancel={this.handleCancelButtonClick}
            initialValues={initialValues}
            validate={validateEmployment}
            type={type}
          />
        </Card>
      </Flex>
    );
  }

  renderTab() {
    const { isClosed, isImpersonated, isTeamleader, profile, employments } = this.props;
    const { submitProfile } = this.props;

    const employmentRecords = [];
    employments.forEach((employment, index) => {
      const hours = ((employment.scope / 100) * 8.4).toFixed(2);
      employmentRecords.push({
        key: `employment-${index}`,
        employment,
        closed: employment.closed,
        boxes: [
          { width: 1 / 4, label: 'Pensum', value: `${employment.scope}% (${hours}h)`, align: 'left' },
          { width: 1 / 4, label: 'Von', value: moment(employment.start).format('DD.MM.YYYY'), align: 'right' },
          { width: 1 / 4, label: 'Bis', value: employment.end ? moment(employment.end).format('DD.MM.YYYY') : 'unbefristed', align: 'right' },
        ],
      });
    });

    return (
      <Flex wrap is="section" px={['16px', '16px', '16px', '100px']} py="16px">
        <Box width={1}>
          <EditableList
            header="Arbeitspensum"
            records={employmentRecords}
            hasActionButtons={!isImpersonated}
            validate={{}}
            handleCreate={() => this.props.setComponent({ component: 'form', record: {} })}
            handleEdit={(record) => this.props.setComponent({ component: 'form', record: record.employment })}
            handleDelete={(record) => this.toggleDialog(record.employment, false)}
          />
          <Dialog
            actions={[
              <ActionButton
                handleAction={() => this.toggleDialog(null, true)}
                label="Löschen"
                primary
              />,
              <ActionButton
                handleAction={() => this.toggleDialog(null, false)}
                label="Abbrechen"
                secondary
                style={{ marginLeft: '5px' }}
              />,
            ]}
            open={this.state.open}
          >
            Dieses Arbeitspensum wirklich löschen?
          </Dialog>
          <EditableList
            header="Geplante Abwesenheiten"
            records={[
              { key: 'plannedVacations',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'Ferien', align: 'left' },
                  { width: 1 / 5, label: 'Tage', value: profile.plannedVacations.toString(), align: 'right', name: 'plannedVacations' },
                ],
              },
              { key: 'plannedMixed',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'Militär und Diverses', align: 'left' },
                  { width: 1 / 5, label: 'Tage', value: profile.plannedMixed.toString(), align: 'right', name: 'plannedMixed' },
                ],
              },
              { key: 'plannedQuali',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'Bewilligte Nachqual.', align: 'left' },
                  { width: 1 / 5, label: 'Stunden', value: profile.plannedQuali.toString(), align: 'right', name: 'plannedQuali' },
                ],
              },
              { key: 'plannedPremiums',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'Treueprämien', align: 'left' },
                  { width: 1 / 5, label: 'Tage', value: profile.plannedPremiums.toString(), align: 'right', name: 'plannedPremiums' },
                ],
              },
            ]}
            validate={{
              plannedVacations: validate,
              plannedMixed: validate,
              plannedQuali: validate,
              plannedPremiums: validate,
            }}
            handleSubmit={({ value }, record) => {
              const payload = {
                id: profile.id,
              };
              if (value === '') {
                payload[record.key] = 0;
              } else {
                payload[record.key] = parseFloat(value);
              }
              submitProfile.trigger(payload);
            }}
            isClosed={isClosed || isImpersonated}
          />
          <EditableList
            header="Überträge aus dem Vorjahr"
            informations="Diese Werte werden zu Beginn des neuen Jahres automatisch berechnet und überschrieben."
            records={[
              { key: 'transferTotalLastYear',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'Totale Jahresarbeitszeit letztes Jahr', align: 'left' },
                  { width: 1 / 5, label: 'Stunden', value: profile.transferTotalLastYear.toString(), align: 'right', name: 'transferTotalLastYear' },
                ],
              },
              { key: 'transferOvertime',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'Überzeit (maximum 1%)', align: 'left' },
                  { width: 1 / 5, label: 'Stunden', value: profile.transferOvertime.toString(), align: 'right', name: 'transferOvertime' },
                ],
              },
              { key: 'transferGrantedVacations',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'bewilligte Ferien', align: 'left' },
                  { width: 1 / 5, label: 'Tage', value: profile.transferGrantedVacations.toString(), align: 'right', name: 'transferGrantedVacations' },
                ],
              },
              { key: 'transferGrantedOvertime',
                boxes: [
                  { width: 4 / 5, label: 'Bezeichnung', value: 'bewilligte Überzeit', align: 'left' },
                  { width: 1 / 5, label: 'Stunden', value: profile.transferGrantedOvertime.toString(), align: 'right', name: 'transferGrantedOvertime' },
                ],
              },
            ]}
            validate={{
              transferTotalLastYear: validate,
              transferOvertime: validate,
              transferGrantedVacations: validate,
              transferGrantedOvertime: validate,
            }}
            handleSubmit={({ value }, record) => {
              const payload = {
                id: profile.id,
              };
              if (value === '') {
                payload[record.key] = 0;
              } else {
                payload[record.key] = parseFloat(value);
              }
              submitProfile.trigger(payload);
            }}
            isClosed={isClosed || (isImpersonated && !isTeamleader)}
          />
        </Box>
      </Flex>
    );
  }

  render() {
    return this.props.renderComponent === 'employment' ? this.renderTab() : this.renderForm();
  }
}

EmploymentTab.propTypes = {
  // properties
  renderComponent: PropTypes.oneOf(['employment', 'form']).isRequired,
  isClosed: PropTypes.bool.isRequired,
  isImpersonated: PropTypes.bool,
  isTeamleader: PropTypes.bool,
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
  employments: PropTypes.array.isRequired,
  record: PropTypes.object.isRequired,
  // actions
  submitProfile: PropTypes.func.isRequired,
  setComponent: PropTypes.func.isRequired,
  // routines
  createEmployment: PropTypes.func.isRequired,
  editEmployment: PropTypes.func.isRequired,
  deleteEmployment: PropTypes.func.isRequired,
};

export default EmploymentTab;
