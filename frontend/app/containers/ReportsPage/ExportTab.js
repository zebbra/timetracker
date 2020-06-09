/**
*
* ExportTab
*
*/


import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindRoutineCreators } from 'redux-saga-routines';
import { Card } from 'material-ui/Card';
import { Flex } from 'grid-styled';
import { fromJS } from 'immutable';
import { List, ListItem } from 'material-ui/List';
import moment from 'moment-timezone';

import CardHeader from 'components/CardHeader';
import Form from 'containers/Form';

import { EXPORT_FORM } from './constants';
import { validateExport } from './validator';
import { submitExport } from './routines';
import { exportData, actionButtons } from './dataFormat';
import InformationWrapper from './Wrapper';

// eslint-disable-next-line react/prefer-stateless-function
export class ExportTab extends React.PureComponent {
  render() {
    const initialValues = fromJS({
      start: moment().startOf('year').startOf('day').toDate(),
      end: moment().endOf('day').toDate(),
      flat: true,
      comments: false,
    });

    return (
      <Flex wrap is="section" px={['16px', '150px', '200px', '300px', '400px']} py="16px">
        <Card style={{ width: '100%' }}>
          <CardHeader title={'CSV-Export erstellen'} />
          <Form
            form={EXPORT_FORM}
            onSubmit={this.props.submitExport}
            formFields={exportData}
            actionButtons={actionButtons}
            cancel={this.handleCancelButtonClick}
            initialValues={initialValues}
            validate={validateExport}
            type={'create'}
            initialValid
          />
          <InformationWrapper>
            <h2>Informationen</h2>
          </InformationWrapper>
          <List>
            <ListItem disabled primaryText="Der Report darf nicht über mehrere Jahre gewählt werden." />
            <ListItem disabled primaryText="Falls Werte zusammenfassen deaktiviert ist, werden die Einträge für jeden einzelnen Tag über den gewählten Zeitraum ausgewiesen, ansonst werden die Werte aufsummiert." />
            <ListItem disabled primaryText="Falls Werte zusammenfassen deaktiviert ist, werden zusätzlich die Bemerkungen ausgewiesen." />
            <ListItem disabled primaryText="Der erste Von-Bis Eintrag enthält jeweils zusätzlich den Übertrag für Überzeit und bewilligte Überzeit vom letzten Jahr." />
            <ListItem disabled primaryText="Der Soll-Zeit vom Von-Bis Eintrag wird automatisch eine Stunde abgezogen (Zwibelenmärit)." />
            <ListItem disabled primaryText="Der Ferien Eintrag enthält zusätzlich den Übertrag für bewilligte Ferien vom letzten Jahr." />
            <ListItem disabled primaryText="Einträge welche auf Lektionen basieren, werden anhand des entsprechenden Umrechnungsfaktors in Stunden umgewandelt." />
            <ListItem disabled primaryText="Einträge welche auf Tage basieren werden, in Stunden umgerechnet. Falls mehrere Anstellungen mit unterschiedlichen Anstellungsgraden über den gewählten Zeitraum existieren, werden die Stunden gleitend gemäss Anstellungsrad an den entsprechenden Tagen umgerechnet." />
          </List>
        </Card>
      </Flex>
    );
  }
}

ExportTab.propTypes = {
  // routines
  submitExport: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    ...bindRoutineCreators({ submitExport }, dispatch),
  };
}

export default connect(null, mapDispatchToProps)(ExportTab);
