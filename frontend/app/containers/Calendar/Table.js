import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import moment from 'moment';
import { fromJS } from 'immutable';

import { makeSelectTracks, makeSelectElements } from './selectors';

const UNIT_LOOKUP = {
  l: 'Lektionen',
  ls: 'Lektion',
  h: 'Stunden',
  hs: 'Stunde',
  n: 'Stunden',
  ns: 'Stunde',
  d: 'Tage',
  ds: 'Tag',
};

class CalendarTable extends React.PureComponent {
  render() {
    function unitLookup(value, unit) {
      const key = `${unit}${value === 1 ? 's' : ''}`;
      return UNIT_LOOKUP[key] || '';
    }

    const genHeaders = () => {
      const headers = [<td key={'header-element'}>{'Element'}</td>];
      const startOfWeek = this.props.selectedDate.clone().startOf('isoweek');

      for (let i = 0; i < 7; i += 1) {
        const weekday = startOfWeek.clone().add(i, 'days');
        headers.push(<td key={`header-${i}`}>{weekday.format('dd DD. MMM')}</td>);
      }

      return headers;
    };

    const genRows = (elements, type) => {
      const rows = [];

      elements.filter((element) => element.get('type') === type && !element.get('hidden')).forEach((element, index) => {
        const elementKey = `print-label-${element.get('id')}-${index}`;
        const cols = [<td key={elementKey}>{element.get('label')}</td>];

        for (let i = 0; i < 7; i += 1) {
          const track = (this.props.tracks.get(i.toString()) || fromJS([])).filter((entry) => element.get('id') === entry.get('elementId')).first();
          cols.push(
            <td key={`print-value-${element.get('id')}-${i}`}>{track && (`${track.get('value')} ${unitLookup(track.get('value'), element.get('unit'))}`)}</td>
          );
        }

        rows.push(<tr key={`row-${elementKey}`}>{cols}</tr>);
      });

      return rows;
    };

    return (
      <section id="export-content">
        <header>
          <h3>
            <span>
              {`Zeiterfassung ${this.props.firstName} ${this.props.lastName} / `}
            </span>
            <span className={'week'}>
              {`${moment().startOf('week').format('dd DD. MMM')} - ${moment().endOf('week').format('dd DD. MMM Y')}`}
            </span>
          </h3>
        </header>
        <table>
          <thead>
            <tr>
              {genHeaders()}
            </tr>
          </thead>
          <tbody>
            {genRows(this.props.elements, 'range')}
            {genRows(this.props.elements, 'dynamic')}
            {genRows(this.props.elements, 'static')}
          </tbody>
        </table>
      </section>
    );
  }

}

CalendarTable.propTypes = {
  // properties
  selectedDate: MomentPropTypes.momentObj.isRequired,
  elements: PropTypes.object.isRequired,
  tracks: PropTypes.object.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};

const mapStateToProps = () => createStructuredSelector({
  elements: makeSelectElements(),
  tracks: makeSelectTracks(),
});

export default connect(mapStateToProps)(CalendarTable);
