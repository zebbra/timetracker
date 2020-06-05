/**
*
* BaselineChart
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import { timeFormat, timeFormatDefaultLocale } from 'd3-time-format';
import chFormat from 'd3-time-format/locale/de-CH.json';
import {
  ChartContainer,
  ChartRow,
  Charts,
  YAxis,
  LineChart,
  Baseline,
  Resizable,
  styler as Styler,
} from 'react-timeseries-charts';

import LegendWrapper, { Tracker } from './Wrapper';

timeFormatDefaultLocale(chFormat);

const baselineStyle = {
  line: {
    stroke: 'steelblue',
    strokeWidth: 1,
  },
};

const baselineStyleLite = {
  line: {
    stroke: 'steelblue',
    strokeWidth: 1,
    opacity: 0.5,
  },
};


class BaselineChart extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  constructor(props) {
    super(props);

    this.state = {
      tracker: null,
      timerange: null,
    };

    this.handleTrackerChanged = this.handleTrackerChanged.bind(this);
    this.handleTimeRangeChanged = this.handleTimeRangeChanged.bind(this);
  }

  componentWillMount() {
    this.setState({
      timerange: this.props.series.range(),
    });
  }

  shouldComponentUpdate(prefProps, nextProps) {
    return prefProps.selectedYear !== undefined && prefProps.selectedYear !== nextProps.selectedYear;
  }

  componentWillUpdate(nextProps) {
    if (nextProps.series.range().end().getTime() !== this.state.timerange.end().getTime()) {
      this.setState({ timerange: nextProps.series.range() });
    }
  }


  handleTrackerChanged(tracker) {
    const df = timeFormat('%b %d %Y');

    if (tracker) {
      const trackerEvent = this.props.series.atTime(tracker);
      const trackerValue = this.props.columns.map((column) => `${column.label}: ${trackerEvent.get(column.key)}${column.unit}`).join('\n');

      this.setState({
        tracker,
        trackerTime: df(tracker),
        trackerValue,
      });
    }
  }

  handleTimeRangeChanged(timerange) {
    this.setState({ timerange });
  }

  render() {
    const baselines = [];
    if (this.props.withBaselines === true) {
      baselines.push(
        <Baseline
          key="baseline-max"
          axis="y"
          style={baselineStyleLite}
          value={this.props.series.max()}
          label="Max"
          position="right"
        />
      );
      baselines.push(
        <Baseline
          key="baseline-min"
          axis="y"
          style={baselineStyleLite}
          value={this.props.series.min()}
          label="Min"
          position="right"
        />
      );
      baselines.push(
        <Baseline
          key="baseline-avg"
          axis="y"
          style={baselineStyle}
          value={this.props.series.avg()}
          label="Avg"
          position="right"
        />
      );
    }

    const styler = Styler(this.props.style);

    return (
      <Flex is="section" wrap p="16px">
        <Box width={1}>
          <h1>{`${this.props.series.name()} ${this.props.selectedYear}`}</h1>
        </Box>
        <LegendWrapper width={1 / 2}>
          <Tracker>
            {this.state.tracker ? `${this.state.trackerTime}` : ''}
          </Tracker>
        </LegendWrapper>
        <LegendWrapper width={1 / 2}>
          <Tracker style={{ textAlign: 'right' }}>
            {this.state.tracker ? `${this.state.trackerValue}` : ''}
          </Tracker>
        </LegendWrapper>
        <Box width={1}>
          <Resizable>
            <ChartContainer
              timeRange={this.state.timerange}
              trackerPosition={this.state.tracker}
              onTrackerChanged={this.handleTrackerChanged}
              enablePanZoom
              maxTime={this.props.series.range().end()}
              minTime={this.props.series.range().begin()}
              onTimeRangeChanged={this.handleTimeRangeChanged}
              minDuration={1000 * 60 * 60 * 24}
            >
              <ChartRow height="150">
                <YAxis
                  id="y"
                  label={this.props.yAxisLabel}
                  min={this.props.series.min()}
                  max={this.props.series.max()}
                  width="80"
                  type="linear"
                  labelOffset={-10}
                />
                <Charts>
                  <LineChart
                    axis="y"
                    breakLine={false}
                    series={this.props.series}
                    columns={this.props.columns.map((column) => column.key)}
                    interpolation="curveBasis"
                    style={styler}
                  />
                  { baselines }
                </Charts>
              </ChartRow>
            </ChartContainer>
          </Resizable>
        </Box>
      </Flex>
    );
  }
}

BaselineChart.propTypes = {
  yAxisLabel: PropTypes.string.isRequired,
  series: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
  })).isRequired,
  style: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    width: PropTypes.number,
    dashed: PropTypes.bool,
  })).isRequired,
  withBaselines: PropTypes.bool.isRequired,
  selectedYear: PropTypes.number.isRequired,
};

export default BaselineChart;
