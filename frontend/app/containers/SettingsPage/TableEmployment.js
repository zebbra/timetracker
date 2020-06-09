import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

class EmploymentSettingTable extends React.PureComponent {
  render() {
    const genRows = (sectionIndex) => {
      const rows = [];

      this.props.employments.forEach((employment, index) => {
        const hours = ((employment.scope / 100) * 8.4).toFixed(2);

        rows.push(
          <tr key={`section-${sectionIndex}-row-${index}`}>
            <td className={'column-0'}>{`${employment.scope}% (${hours}h)`}</td>
            <td className={'column-1'}>{moment(employment.start).format('DD.MM.YYYY')}</td>
            <td className={'column-2'}>{employment.end ? moment(employment.end).format('DD.MM.YYYY') : 'unbefristed'}</td>
          </tr>
        );
      });

      return rows;
    };

    const genTables = () => {
      const tables = [];

      tables.push(
        <div className={'sub-table-wrapper'} key={'arbeitspensum'}>
          <h3>{'Arbeitspensum'}</h3>
          <table>
            <thead>
              <tr>
                <td className={'column-0'}>Pensum</td>
                <td className={'column-1'}>Von</td>
                <td className={'column-2'}>Bis</td>
              </tr>
            </thead>
            <tbody>
              {genRows(1)}
            </tbody>
          </table>
        </div>
      );

      tables.push(
        <div className={'sub-table-wrapper'} key={'planned-absences'}>
          <h3>Geplante Abwesenheiten</h3>
          <table>
            <thead>
              <tr>
                <td className={'column-0'}>Bezeichnung</td>
                <td className={'column-1'}>Tage</td>
                <td className={'column-2'}>Stunden</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={'column-0'}>Ferien</td>
                <td className={'column-1'}>{this.props.profile.plannedVacations.toFixed(2)}</td>
                <td className={'column-2'}></td>
              </tr>
              <tr>
                <td className={'column-0'}>Militär und Diverses</td>
                <td className={'column-1'}>{this.props.profile.plannedMixed.toFixed(2)}</td>
                <td className={'column-2'}></td>
              </tr>
              <tr>
                <td className={'column-0'}>Bewilligte Nachqual.</td>
                <td className={'column-1'}></td>
                <td className={'column-2'}>{this.props.profile.plannedQuali.toFixed(2)}</td>
              </tr>
              <tr>
                <td className={'column-0'}>Treueprämien</td>
                <td className={'column-1'}>{this.props.profile.plannedPremiums.toFixed(2)}</td>
                <td className={'column-2'}></td>
              </tr>
            </tbody>
          </table>
        </div>
      );

      tables.push(
        <div className={'sub-table-wrapper'} key={'transfers'}>
          <h3>Überträge aus dem Vorjahr</h3>
          <table>
            <thead>
              <tr>
                <td className={'column-0'}>Bezeichnung</td>
                <td className={'column-1'}>Tage</td>
                <td className={'column-2'}>Stunden</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={'column-0'}>Totale Jahresarbeitszeit letztes Jahr</td>
                <td className={'column-1'}></td>
                <td className={'column-2'}>{this.props.profile.transferTotalLastYear.toFixed(2)}</td>
              </tr>
              <tr>
                <td className={'column-0'}>Überzeit (maximum 1%)</td>
                <td className={'column-1'}></td>
                <td className={'column-2'}>{this.props.profile.transferOvertime.toFixed(2)}</td>
              </tr>
              <tr>
                <td className={'column-0'}>bewilligte Ferien</td>
                <td className={'column-1'}>{this.props.profile.transferGrantedVacations.toFixed(2)}</td>
                <td className={'column-2'}></td>
              </tr>
              <tr>
                <td className={'column-0'}>bewilligte Überzeit</td>
                <td className={'column-1'}></td>
                <td className={'column-2'}>{this.props.profile.transferGrantedOvertime.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );

      return tables;
    };

    return (
      <section id="export-content">
        <header>
          <h3>
            <span>
              {`Anstellung ${this.props.firstName} ${this.props.lastName} / `}
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


EmploymentSettingTable.propTypes = {
  // properties

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
  selectedYear: PropTypes.number.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};


export default EmploymentSettingTable;
