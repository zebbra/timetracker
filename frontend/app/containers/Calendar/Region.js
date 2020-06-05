/**
*
* Region
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'grid-styled';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map } from 'immutable';

import CalendarCell from 'components/CalendarCell';
import CalendarInput from 'containers/CalendarInput';
import { UNITS } from 'containers/Calendar/constants';

import { navigate } from './actions';
import { makeSelectSelectedCell } from './selectors';

import Label from './Label';


export class Region extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { isLabel, selectedCell, region, elements } = this.props;

    const calendarColumnRegionCells = [];
    const isSelectedCell = (element) => (
      selectedCell &&
      selectedCell.get('elementId') === element.get('id') &&
      selectedCell.get('dayOfWeek') === element.get('dayOfWeek').getDay() &&
      !isLabel
    );

    elements.forEach((element, index) => {
      let elementIndex;
      if (index === 0) {
        elementIndex = 'first';
        if (elements.size === 1) {
          elementIndex = 'first-last';
        }
      } else if (index === elements.size - 1) {
        elementIndex = 'last';
      }
      if (isSelectedCell(element)) {
        let slots = [];
        if (element.get('type') === 'range') {
          slots = elements.filter((entry) => entry.get('id') !== element.get('id') && entry.get('unit') === 'r' && entry.hasIn(['track', 'value'])).map((entry) => entry.getIn(['track', 'value'])).toJS();
        }

        calendarColumnRegionCells.push(
          <CalendarInput
            key={`calendar-input-region-${region.get('type')}-cell-${element.get('id')}`}
            element={element.merge(Map({ selected: true, slots }))}
            region={region}
            isLabel={isLabel}
          />
        );
      } else {
        calendarColumnRegionCells.push(
          <CalendarCell
            key={`calendar-column-region-${region.get('type')}-cell-${element.get('id')}`}
            element={element.set('selected', false)}
            region={region}
            isLabel={isLabel}
            navigate={this.props.navigate}
            columnIndex={this.props.columnIndex}
            elementIndex={elementIndex}
          />
        );
      }
    });

    return (
      <Flex is="section" wrap className="calendar-region" pb={['16px', '16px', '40px']}>
        {region.get('label') && <Label is="section" width={1}>{isLabel ? '' : region.get('label')}</Label>}
        {calendarColumnRegionCells}
      </Flex>
    );
  }
}

Region.propTypes = {
  // properties
  columnIndex: PropTypes.string,
  isLabel: PropTypes.bool,
  selectedCell: ImmutablePropTypes.contains({
    elementId: PropTypes.string,
    dayOfWeek: PropTypes.number,
  }),
  region: ImmutablePropTypes.contains({
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
  }),
  elements: ImmutablePropTypes.listOf(ImmutablePropTypes.contains({
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    label: PropTypes.string,
    unit: PropTypes.oneOf(UNITS).isRequired,
    type: PropTypes.string.isRequired,
    dayOfWeek: PropTypes.instanceOf(Date).isRequired,
    holiday: PropTypes.bool,
    hidden: PropTypes.bool,
    hiddenWithTrack: PropTypes.bool,
    disabled: PropTypes.bool,
    closed: PropTypes.bool,
    selected: PropTypes.bool,
    track: PropTypes.object,
  })).isRequired,

  // actions
  navigate: PropTypes.func.isRequired,
};


const mapStateToProps = createStructuredSelector({
  selectedCell: makeSelectSelectedCell(),
});

function mapDispatchToProps(dispatch) {
  return {
    navigate: bindActionCreators(navigate, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Region);
