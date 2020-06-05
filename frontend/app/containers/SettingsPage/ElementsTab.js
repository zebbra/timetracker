/**
*
* ElementsTab
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import { groupBy, sortBy } from 'lodash';
import ReactTooltip from 'react-tooltip';

import EditableList from 'components/EditableList';
import InfoIcon from 'material-ui/svg-icons/action/info';

import validate from './validator';
import InfoIconWrapper from './Wrapper';


function ElementsTab(props) {
  const { isClosed, isImpersonated, selectedYear, elements } = props;
  const { submitElement } = props;

  const editableLists = [];

  if (elements.length === 0) {
    editableLists.push(
      <section key="empty-editable-list">
        <h2>Es konnten keine Leistungselemente gefunden werden</h2>
      </section>
    );
  } else {
    const groupedRecords = groupBy(elements.filter((e) => e.project !== 'Default'), 'project');

    Object.keys(groupedRecords).forEach((projectName) => {
      const records = [];

      sortBy(groupedRecords[projectName], 'label').forEach((element) => {
        const width = [1 / 4, 1 / 10];
        const value = element.setpoint && element.setpoint.value;
        const name = 'value';
        const tooltipId = `element-list-tooltip-${element.id}`;
        const tooltip = (
          <InfoIconWrapper>
            <InfoIcon data-tip={element.tooltip} data-for={tooltipId} />
            <ReactTooltip html id={tooltipId} />
          </InfoIconWrapper>
        );

        const boxes = [];
        boxes.push({ width: [1, 6 / 10], label: 'Bezeichnung', value: element.label, align: 'left' });
        if (element.unit === 'l') {
          boxes.push({ width, label: 'Soll L', value: (value && value.toString()) || '0', name, align: 'right' });
          boxes.push({ width, label: 'Soll H', value: (value && (value * element.factor).toFixed(2)) || 0, align: 'right' });
        } else {
          boxes.push({ width, label: '', value: '', align: 'right' });
          boxes.push({ width, label: 'Soll H', value: (value && value.toString()) || '0', name, align: 'right' });
        }
        boxes.push({ width, label: 'Ist H', value: element.actual, align: 'right' });
        boxes.push({ width, label: false, value: tooltip, align: 'center', disableTruncate: true });

        records.push({
          key: element.id,
          setpoint: element.setpoint,
          boxes,
        });
      });

      editableLists.push(
        <EditableList
          key={`editable-list-${projectName}`}
          header={projectName}
          records={records}
          validate={{
            value: validate,
          }}
          handleSubmit={({ value }, record) => submitElement.trigger(Object.assign(record.setpoint || {}, { year: selectedYear, elementId: record.key, value }))}
          isClosed={isClosed || isImpersonated}
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

ElementsTab.propTypes = {
  // properties
  isClosed: PropTypes.bool.isRequired,
  isImpersonated: PropTypes.bool,
  selectedYear: PropTypes.number.isRequired,
  elements: PropTypes.array.isRequired,
  // actions
  submitElement: PropTypes.func.isRequired,
};

export default ElementsTab;
