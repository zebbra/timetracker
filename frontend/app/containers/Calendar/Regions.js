/*
 *
 * Regions
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Map } from 'immutable';
import { Box } from 'grid-styled';

import {
  makeSelectRegions,
  makeSelectElements,
  makeSelectTracks,
  makeSelectHolidays,
  makeSelectShowWeekendWithTrack,
} from './selectors';
import { prepareElementsRender } from './helpers';

import Region from './Region';


export class Regions extends React.PureComponent {
  shouldComponentUpdate(nextProps) {
    return this.props.dayOfWeek.isSame(nextProps.dayOfWeek);
  }

  render() {
    const elements = prepareElementsRender(
      this.props.elements,
      this.props.dayOfWeek,
      this.props.tracks,
      this.props.holidays,
      this.props.showWeekendWithTrack
    );

    const calendarColumnRegions = [];
    const weekday = this.props.dayOfWeek.weekday();
    let columnCellIdx = weekday * elements.size;

    this.props.regions.forEach((region) => {
      const calendarColumnRegionElements = elements.filter((element) => element.get('type') === region.get('type')).map((element) => {
        columnCellIdx += 1;
        return element.merge(Map({
          index: columnCellIdx,
          closed: this.props.isImpersonated || element.get('closed'),
        }));
      });

      calendarColumnRegions.push(
        <Region
          key={`calendar-column-${weekday}-region-${region.get('type')}`}
          isLabel={this.props.isLabel}
          region={region}
          elements={calendarColumnRegionElements}
          columnIndex={this.props.columnIndex}
        />
      );
    });

    return (
      <Box width={1} className="region-wrapper">
        {calendarColumnRegions}
      </Box>
    );
  }
}

Regions.propTypes = {
  // properties
  columnIndex: PropTypes.string,
  isLabel: PropTypes.bool,
  elements: PropTypes.object.isRequired,
  tracks: PropTypes.object.isRequired,
  holidays: PropTypes.object.isRequired,
  dayOfWeek: MomentPropTypes.momentObj.isRequired,
  showWeekendWithTrack: PropTypes.bool.isRequired,
  isImpersonated: PropTypes.bool.isRequired,
  regions: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => createStructuredSelector({
  elements: makeSelectElements(),
  tracks: makeSelectTracks(ownProps.dayOfWeek.weekday().toString()),
  holidays: makeSelectHolidays(),
  regions: makeSelectRegions(),
  showWeekendWithTrack: makeSelectShowWeekendWithTrack(),
});

export default connect(mapStateToProps)(Regions);
