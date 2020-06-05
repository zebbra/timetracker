/**
*
* ElementsTab
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import { compact } from 'lodash';

import EditableList from 'components/EditableList';

import validate from './validator';


export class ElementsTab extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const editableLists = [];
    const labelWidth = [1, 7 / 10];
    const fieldWidth = [1 / 3, 1 / 10];
    const align = 'right';
    const isClosed = this.props.isClosed;

    if (this.props.data.length === 0) {
      editableLists.push(
        <section key="empty-editable-list">
          <h2>Es konnten keine Einträge gefunden werden</h2>
        </section>
      );
    } else {
      this.props.data.forEach((section, index) => {
        const key = `generic-reporting-section-${index}`;
        const header = section.title;
        const records = [];

        section.data.forEach((data, dataIndex) => {
          let description;
          const targetLession = { width: fieldWidth, label: 'Soll [L]', value: data[1] || '-', align };

          let targetHours = { width: fieldWidth, label: 'Soll [h]', value: data[2], align };
          if (section.title === 'Manuelle Korrekturen') {
            // Add the manual correction description input field
            description = { width: labelWidth, label: 'Beschreibung', value: data[4], name: 'manualCorrectionDescription', align: 'left' };
            targetHours = { width: [1, 1 / 10], label: 'Soll [h]', value: data[2].toString(), name: 'manualCorrection', align: 'left' };
          }

          let actualHours = { width: fieldWidth, label: '', value: '', align };
          if (data[3] !== null) {
            actualHours = { width: fieldWidth, label: 'Ist [h]', value: data[3] || 0, align };
          }

          const boxes = compact([
            { width: description ? 1 : labelWidth, label: false, value: data[0], align: 'left' },
            description,
            targetLession,
            targetHours,
            actualHours,
          ]);

          records.push({
            key: `${key}-box-${dataIndex}`,
            boxes,
          });
        });

        editableLists.push(
          <EditableList
            key={key}
            header={header}
            records={records}
            validate={validate}
            handleSubmit={(value, record, name) => this.props.submitManualCorrection.trigger(Object.assign(value, { id: this.props.profile, name }))}
            isClosed={isClosed}
          />
        );
      });
    }

    return (
      <Flex wrap is="section" px={['16px', '16px', '16px', '100px']} py="16px">
        <Box width={1}>
          {editableLists}
        </Box>
      </Flex>
    );
  }
}

ElementsTab.propTypes = {
  // properties
  isClosed: PropTypes.bool.isRequired,
  profile: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({
    order: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
  })).isRequired,
  // routines
  submitManualCorrection: PropTypes.func.isRequired,
};

export default ElementsTab;
