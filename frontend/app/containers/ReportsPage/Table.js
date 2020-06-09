import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';


class ElementReportTable extends React.PureComponent {
  render() {
    const genHeaders = (index) => [
      <td className={'column-0-60'} key={`element-header-${index}`}>Element</td>,
      <td className={'column-1'} key={`solll-header-${index}`}>Soll [L]</td>,
      <td className={'column-2'} key={`sollh-header-${index}`}>Soll [h]</td>,
      <td className={'column-3'} key={`isth-header-${index}`}>Ist [h]</td>,
      <td className={'column-4'} key={`saldoh-header-${index}`}>Saldo</td>,
    ];

    const genRows = (sectionData, sectionIndex) => {
      const rows = [];

      sectionData.forEach((data, index) => {
        rows.push(
          <tr key={`section-${sectionIndex}-row-${index}`}>
            <td className={'column-0-60'}>{data[0]}</td>
            <td className={'column-1'}>{data[1] !== null && data[1].toFixed(2)}</td>
            <td className={'column-2'}>{data[2] !== null && data[2].toFixed(2)}</td>
            <td className={'column-3'}>{data[3] !== null && data[3].toFixed(2)}</td>
            <td className={'column-4'}>{((data[2] * -1) + data[3]).toFixed(2)}</td>
          </tr>
        );
      });

      return rows;
    };

    const genTables = () => {
      const tables = [];

      this.props.data.forEach((section, index) => {
        const key = `generic-reporting-section-${index}`;

        tables.push(
          <div className={`sub-table-wrapper table-${index}`} key={key}>
            <h3>{section.title}</h3>
            <table>
              <thead>
                <tr>{genHeaders(index)}</tr>
              </thead>
              <tbody>
                {genRows(section.data, index)}
              </tbody>
            </table>
          </div>
        );
      });

      return tables;
    };

    const timeRange = moment().year() === this.props.selectedYear
      ? `${moment().startOf('year').format('dd DD. MMM')} - ${moment().format('dd DD. MMM Y')}`
      : `${moment().year(this.props.selectedYear).startOf('year').format('dd DD. MMM')} - ${moment().year(this.props.selectedYear).endOf('year').format('dd DD. MMM Y')}`;

    return (
      <section id="export-content">
        <header>
          <h3>
            <span>
              {`Element-Report ${this.props.firstName} ${this.props.lastName} / `}
            </span>
            <span className={'week'}>
              {timeRange}
            </span>
          </h3>
        </header>
        {genTables()}
      </section>
    );
  }
}


ElementReportTable.propTypes = {
  // properties
  data: PropTypes.arrayOf(PropTypes.shape({
    order: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
  })).isRequired,
  selectedYear: PropTypes.number.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};


export default ElementReportTable;
