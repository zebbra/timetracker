/**
*
* CalendarCell
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import ReactTooltip from 'react-tooltip';
import Truncate from 'react-truncate';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { UNITS } from 'containers/Calendar/constants';

import DefaultCell from './DefaultCell';
import RangeCell from './RangeCell';
import HolidayCell from './HolidayCell';
import LabelCell from './LabelCell';
import TextCell from './TextCell';


export class CalendarCell extends React.PureComponent {

  constructor(props) {
    super(props);

    this.renderRangeCell = this.renderRangeCell.bind(this);
    this.renderDefaultCell = this.renderDefaultCell.bind(this);
    this.renderHolidayCell = this.renderHolidayCell.bind(this);
    this.renderLabelCell = this.renderLabelCell.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const trackChanged = this.props.element.get('track') !== nextProps.element.get('track');
    const disabledChanged = this.props.element.get('disabled') !== nextProps.element.get('disabled');
    const closedChanged = this.props.element.get('closed') !== nextProps.element.get('closed');
    const selectedChanged = this.props.element.get('selected') !== nextProps.element.get('selected');
    const hiddenChanged = this.props.element.get('hiddenWithTrack') !== nextProps.element.get('hiddenWithTrack');
    const rowIndexChanged = this.props.element.get('rowIndex') !== nextProps.element.get('rowIndex');

    return trackChanged || disabledChanged || closedChanged || selectedChanged || hiddenChanged || rowIndexChanged;
  }

  renderRangeCell(classes) {
    const label = 'Von-Bis';
    const unit = '[hh:mm-hh:mm]';
    const value = this.props.element.getIn(['track', 'value']);
    const navigate = {
      elementId: this.props.element.get('id'),
      dayOfWeek: this.props.element.get('dayOfWeek').getDay(),
      rowIndex: this.props.element.get('rowIndex'),
    };

    return (
      <RangeCell width="100%" is="section" className={classes.join(' ')} onTouchTap={() => this.props.navigate(navigate)}>
        <Flex wrap align="center" justify="space-around" is="section" width="100%" px="10px">
          <Box width="100%" className="cell-label">
            {label}
          </Box>
          <Box width={3 / 6} className="cell-value">
            {value}
          </Box>
          <Box ml="auto" className="cell-unit">
            {unit}
          </Box>
        </Flex>
      </RangeCell>
    );
  }

  renderDefaultCell(classes) {
    const label = this.props.element.get('label');
    const unit = `[${this.props.element.get('unit')}]`;
    const value = this.props.element.getIn(['track', 'value']);
    const navigate = {
      elementId: this.props.element.get('id'),
      dayOfWeek: this.props.element.get('dayOfWeek').getDay(),
      rowIndex: this.props.element.get('rowIndex'),
    };

    return (
      <DefaultCell width="100%" is="section" className={classes.join(' ')} onTouchTap={() => this.props.navigate(navigate)}>
        <Flex wrap align="center" justify="space-around" is="section" width="100%" px="10px">
          <Box width="100%" className="cell-label">
            <Truncate lines={1} ellipsis={<span>...</span>}>{label}</Truncate>
          </Box>
          <Box width={5 / 6} className="cell-value">
            {value}
          </Box>
          <Box ml="auto" className="cell-unit">
            {unit}
          </Box>
        </Flex>
      </DefaultCell>
    );
  }

  renderTextCell(classes) {
    function escapeLabel(label) {
      if (label.startsWith('Bemerkungen')) {
        return 'Bemerkungen';
      }

      return label;
    }

    const label = escapeLabel(this.props.element.get('label'));
    const value = this.props.element.getIn(['track', 'value']);
    const tooltipId = `note-tooltip-${this.props.element.get('dayOfWeek').getDay()}-${this.props.element.get('index')}`;
    const navigate = {
      elementId: this.props.element.get('id'),
      dayOfWeek: this.props.element.get('dayOfWeek').getDay(),
      rowIndex: this.props.element.get('rowIndex'),
    };

    return (
      <TextCell width="100%" is="section" className={classes.join(' ')} onTouchTap={() => this.props.navigate(navigate)}>
        <Flex wrap align="center" justify="space-around" is="section" width="100%" px="10px" data-tip data-for={tooltipId}>
          <Box width="100%" className="cell-label">
            <Truncate lines={1} ellipsis={<span>...</span>}>{label}</Truncate>
          </Box>
          <Box width={1} className="cell-value">
            <Truncate lines={1} ellipsis={<span>...</span>}>{value}</Truncate>
          </Box>
          { value !== undefined &&
            <ReactTooltip id={tooltipId}>
              {value}
            </ReactTooltip>
          }
        </Flex>
      </TextCell>
    );
  }

  renderHolidayCell(classes) {
    const label = this.props.element.getIn(['track', 'label']);
    const unit = `[${this.props.element.get('unit')}]`;
    const value = this.props.element.getIn(['track', 'value']);
    const tooltipId = `holiday-tooltip-${this.props.element.get('dayOfWeek').getDay()}`;

    return (
      <HolidayCell width="100%" is="section" className={classes.join(' ')}>
        <Flex wrap align="center" justify="space-around" is="section" width="100%" px="10px" data-tip data-for={tooltipId}>
          { value !== undefined && <Box width="100%" className="cell-label">{label}</Box>}
        </Flex>
        { value !== undefined &&
          <ReactTooltip id={tooltipId}>
            <section><Truncate lines={1} ellipsis={<span>...</span>}>{label}</Truncate></section>
            <section>
              <span>{value} {unit}</span>
            </section>
          </ReactTooltip>
        }
      </HolidayCell>
    );
  }

  renderLabelCell() {
    const tooltipId = `label-tooltip-${this.props.element.get('id')}`;

    function escapeLabel(label) {
      if (label.startsWith('Bemerkungen')) {
        return 'Bemerkungen';
      }

      return label;
    }

    return (
      <LabelCell width="100%" is="section" className="calendar-cell-label">
        <Flex wrap align="center" justify="space-around" is="section" width="100%" px="10px">
          <Box width={1} className="cell-label">
            { this.props.element.get('type') === 'dynamic' ?
              <Truncate
                data-tip={this.props.element.get('tooltip')}
                data-for={tooltipId} lines={2}
                ellipsis={<span>...</span>}
              >
                {escapeLabel(this.props.element.get('label'))}
              </Truncate>
              :
              this.props.element.get('label').replace(/-\d/, '')
            }
            <ReactTooltip html id={tooltipId} />
          </Box>
        </Flex>
      </LabelCell>
    );
  }

  render() {
    let cell;
    const classes = ['calendar-cell'];

    if (this.props.columnIndex) {
      classes.push(`column-${this.props.columnIndex}`);
    }
    if (this.props.elementIndex) {
      classes.push(`element-${this.props.elementIndex}`);
    }
    if (this.props.element.get('disabled')) {
      classes.push('disabled');
    }
    if (this.props.element.get('closed')) {
      classes.push('closed');
    }
    if (this.props.element.get('selected')) {
      classes.push('selected');
    }
    if (this.props.element.get('hiddenWithTrack')) {
      classes.push('hidden');
    }

    if (this.props.isLabel) {
      cell = this.renderLabelCell();
    } else if (this.props.element.get('unit') === 't') {
      cell = this.renderTextCell(classes);
    } else if (this.props.region.get('type') === 'range') {
      cell = this.renderRangeCell(classes);
    } else if (this.props.element.get('holiday')) {
      cell = this.renderHolidayCell(classes);
    } else {
      cell = this.renderDefaultCell(classes);
    }

    return cell;
  }
}

CalendarCell.propTypes = {
  // properties
  columnIndex: PropTypes.string,
  elementIndex: PropTypes.string,
  isLabel: PropTypes.bool,
  region: ImmutablePropTypes.contains({
    type: PropTypes.string.isRequired,
    label: PropTypes.string,
  }),
  element: ImmutablePropTypes.contains({
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
  }),
  // actions
  navigate: PropTypes.func.isRequired,
};

export default CalendarCell;
