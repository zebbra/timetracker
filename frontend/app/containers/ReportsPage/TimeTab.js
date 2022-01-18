/**
*
* TimeTab
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import { TimeSeries } from 'pondjs';

import Indicator from 'components/Indicator';
import BaselineChart from 'components/BaselineChart';


export class TimeTab extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    if (this.props.timeseries.length === 0) {
      return null;
    }

    // otherwise last entry is not shown in timeseries graph...
    const last = this.props.timeseries[this.props.timeseries.length - 1];
    this.props.timeseries.push([last[0] + (1000 * 60 * 60 * 24), last[1]]);

    const series = new TimeSeries({
      name: 'Saldo Zeitverlauf',
      columns: ['time', 'value'],
      points: this.props.timeseries,
    });

    const indicators = this.props.indicators.map((indicator, index) => (
      <Box width={[1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6]} key={`indicator-${index}`} p="16px">
        <Indicator
          id={`indicator-${index}`}
          label={indicator.label}
          unit={indicator.unit}
          actual={indicator.actual}
          target={indicator.target}
          saldo={indicator.saldo}
        />
      </Box>
    ));

    return (
      <Flex wrap is="section" justify="space-around">
        <Box width={1} style={{ paddingLeft: 16 }}>
          <h1>Indikatoren</h1>
        </Box>
        {indicators}
        <Box width={1}>
          <BaselineChart
            yAxisLabel="Stunden (h)"
            columns={[{ key: 'value', label: 'Saldo', unit: '[h]' }]}
            style={[{ key: 'value', color: '#F68B24', width: 2 }]}
            series={series}
            withBaselines
            selectedYear={this.props.selectedYear}
          />
        </Box>
      </Flex>
    );
  }
}

TimeTab.propTypes = {
  indicators: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    actual: PropTypes.number.isRequired,
    target: PropTypes.number.isRequired,
    saldo: PropTypes.number.isRequired,
  })).isRequired,
  timeseries: PropTypes.array.isRequired,
  selectedYear: PropTypes.number.isRequired,
};

export default TimeTab;
