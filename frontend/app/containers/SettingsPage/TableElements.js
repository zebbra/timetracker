import React from 'react';
import PropTypes from 'prop-types';
import { groupBy, sortBy } from 'lodash';


class ElementSettingTable extends React.PureComponent {
  render() {
    if (this.props.elements.length === 0) {
      return <section><h2>Es konnten keine Leistungselemente gefunden werden</h2></section>;
    }

    const genHeaders = (index) => [
      <td className={'column-0'} key={`element-header-${index}`}>Element</td>,
      <td className={'column-1'} key={`solll-header-${index}`}>Soll [L]</td>,
      <td className={'column-2'} key={`sollh-header-${index}`}>Soll [h]</td>,
      <td className={'column-3'} key={`isth-header-${index}`}>Ist [h]</td>,
    ];

    const genRows = (sectionData, sectionIndex) => {
      const rows = [];

      sortBy(sectionData, 'label').forEach((element, index) => {
        const targetL = element.setpoint && element.setpoint.value && element.unit === 'l' ? element.setpoint.value.toFixed(2) || '0.00' : '';
        const targetH = element.setpoint && element.setpoint.value ? (element.factor * element.setpoint.value).toFixed(2) : '';
        rows.push(
          <tr key={`section-${sectionIndex}-row-${index}`}>
            <td className={'column-0'}>{element.label}</td>
            <td className={'column-1'}>{targetL}</td>
            <td className={'column-2'}>{targetH}</td>
            <td className={'column-3'}>{element.actual}</td>
          </tr>
        );
      });

      return rows;
    };

    const genTables = () => {
      const tables = [];

      const groupedRecords = groupBy(this.props.elements.filter((e) => e.project !== 'Default'), 'project');
      Object.keys(groupedRecords).forEach((projectName, index) => {
        const key = `elements-setting-section-${index}`;

        tables.push(
          <div className={'sub-table-wrapper'} key={key}>
            <h3>{projectName}</h3>
            <table>
              <thead>
                <tr>{genHeaders(index)}</tr>
              </thead>
              <tbody>
                {genRows(groupedRecords[projectName], index)}
              </tbody>
            </table>
          </div>
        );
      });

      return tables;
    };

    return (
      <section id="export-content">
        <header>
          <h3>
            <span>
              {`Leistungselemente ${this.props.firstName} ${this.props.lastName} / `}
            </span>
            <span className={'week'}>
              {this.props.selectedYear}
            </span>
          </h3>
        </header>
        {genTables()}
      </section>
    );
  }
}


ElementSettingTable.propTypes = {
  // properties
  elements: PropTypes.arrayOf(PropTypes.shape({
    actual: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    project: PropTypes.string.isRequired,
    setpoint: PropTypes.shape({
      value: PropTypes.number.isRequired,
    }),
  })).isRequired,
  selectedYear: PropTypes.number.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};


export default ElementSettingTable;
