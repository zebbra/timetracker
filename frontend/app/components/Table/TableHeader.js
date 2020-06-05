/**
*
* TableHeader
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
import AddBox from 'material-ui/svg-icons/content/add-box';
import FlatButton from 'material-ui/FlatButton';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import ArrowDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ArrowUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import Menu from 'material-ui/Menu';
import moment from 'moment';
import ReactTooltip from 'react-tooltip';

import { HeaderWrapper, MenuItemWrapper } from './Wrapper';


export class TableHeader extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleTouchTap(event) {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: !this.state.open,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const years = [];
    const yearsIcon = this.state.open ? <ArrowUpIcon /> : <ArrowDownIcon />;
    const startYear = moment().subtract(3, 'years').year();
    for (let year = startYear; year < startYear + 6; year += 1) {
      const classNames = [];
      if (year === this.props.selectedYear) {
        classNames.push('active');
      }
      years.push(
        <MenuItemWrapper
          key={`year-select-${year}`}
          onTouchTap={() => this.props.onYearSelect(year)}
          primaryText={year}
          className={classNames.join(' ')}
        />
      );
    }

    return (
      <HeaderWrapper rounded={false}>
        <Flex wrap is="section">
          <Box>
            <Subheader>{this.props.title}</Subheader>
          </Box>
          <Box ml="auto" className="actions">
            { this.props.yearSelect &&
              <FlatButton
                onClick={this.handleTouchTap}
                label={this.props.selectedYear}
                labelPosition="before"
                icon={yearsIcon}
                data-tip="Jahr auswählen"
                data-for="tooltip-year-selection"
              />
            }
            { this.props.addAction &&
              <IconButton
                touch
                data-tip={`${this.props.ressource} hinzufügen`}
                data-for="table-add-new-entry-tooltip"
                onTouchTap={this.props.addAction}
                disabled={this.props.disabledAddButton}
              >
                <AddBox />
                <ReactTooltip id="table-add-new-entry-tooltip" />
              </IconButton>
            }
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              onRequestClose={this.handleRequestClose}
              animation={PopoverAnimationVertical}
            >
              <Menu>{years}</Menu>
            </Popover>
            <ReactTooltip id="tooltip-year-selection" />
          </Box>
        </Flex>
      </HeaderWrapper>
    );
  }
}

TableHeader.propTypes = {
  // properties
  title: PropTypes.string.isRequired,
  ressource: PropTypes.string.isRequired,
  yearSelect: PropTypes.bool,
  selectedYear: PropTypes.number,
  disabledAddButton: PropTypes.bool,
  // actions
  addAction: PropTypes.func,
  onYearSelect: PropTypes.func,
};

export default TableHeader;
