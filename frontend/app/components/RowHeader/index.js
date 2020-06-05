/**
*
* RowHeader
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import muiThemeable from 'material-ui/styles/muiThemeable';
import FlatButton from 'material-ui/FlatButton';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { Tab } from 'material-ui/Tabs';
import VacationIcon from 'material-ui/svg-icons/action/flight-takeoff';
import ArmyIcon from 'material-ui/svg-icons/action/android';
import LoyaltyIcon from 'material-ui/svg-icons/action/loyalty';
import IllnessIcon from 'material-ui/svg-icons/maps/local-hotel';
import DefaultIcon from 'material-ui/svg-icons/action/info-outline';
import RunIcon from 'material-ui/svg-icons/maps/directions-run';
import SchoolIcon from 'material-ui/svg-icons/social/school';
import ArrowDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ArrowUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';

import { iconSize } from 'utils/variables';

import Wrapper, { TabsWrapper, MenuItemWrapper, Indicator, Separator } from './Wrapper';

const IconLookup = {
  vacation: <VacationIcon />,
  army: <ArmyIcon />,
  loyalty: <LoyaltyIcon />,
  run: <RunIcon />,
  school: <SchoolIcon />,
  default: <DefaultIcon />,
  illness: <IllnessIcon />,
};


export class RowHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      downloadOpen: false,
    };

    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleTouchTapDownload = this.handleTouchTapDownload.bind(this);
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

  handleTouchTapDownload() {
    this.setState({
      downloadOpen: !this.state.downloadOpen,
    });
  }

  render() {
    const classes = [];
    if (this.props.isSidebar) {
      classes.push('sidebar');
    }

    const tabs = [];
    if (this.props.tabs) {
      this.props.tabs.forEach((tab, index) => {
        tabs.push(
          <Tab
            key={`tab-${index}`}
            label={tab.label}
            value={tab.value}
            onActive={tab.handleOnActive}
          />
        );
      });
    }

    const years = [];
    const yearsIcon = this.state.open ? <ArrowUpIcon /> : <ArrowDownIcon />;
    if (this.props.selectableYears) {
      const startYear = moment().subtract(this.props.selectableYears, 'years').year();
      for (let year = startYear; year < startYear + (2 * this.props.selectableYears); year += 1) {
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
    }

    const indicators = [];
    if (this.props.indicators) {
      indicators.push(<Separator key="indicator-separator" />);
      this.props.indicators.forEach((indicator, index) => {
        const tooltipId = `row-header-indicator-tooltip-${index}`;
        let prefix = 'Verbleibende';
        if (indicator.label === 'Saldo') {
          prefix = 'Total';
        } else if (['Besondere Abwesenheiten', 'Krankheit'].indexOf(indicator.label) > -1) {
          prefix = 'Bezogene';
        }
        indicators.push(
          <Indicator
            key={`indicator-${index}`}
            px="10px"
            py="5px"
            data-tip={`${prefix} ${indicator.label}`}
            data-for={tooltipId}
          >
            {IconLookup[indicator.icon] || <DefaultIcon />}
            {indicator.saldo}{indicator.unit}
            <ReactTooltip id={tooltipId} />
          </Indicator>
        );
      });
    }

    const downloadOptions = [];
    (this.props.downloadFormats || []).forEach((format, index) => {
      downloadOptions.push(
        <MenuItem
          value={index}
          key={`download-option-${format}`}
          primaryText={`${format.toUpperCase()}`}
          onTouchTap={() => this.props.onDownloadIconClick(format)}
        />
      );
    });

    return (
      <Wrapper className={classes.join(' ')} muiTheme={this.props.muiTheme}>
        <Flex is="section" wrap align="center">
          { this.props.iconLeft &&
            <Box width={iconSize} className="iconLeft">
              <IconButton touch onTouchTap={this.props.onIconLeftClick}>{this.props.iconLeft}</IconButton>
            </Box>
          }
          { tabs.length > 0 ?
            <TabsWrapper value={this.props.tabsValue || tabs[0].value}>{tabs}</TabsWrapper>
            :
            <Box className="title"><Subheader>{this.props.title}</Subheader></Box>
          }
          { indicators.length > 0 && indicators }
          { (years.length > 0 || this.props.hasDownloadIcon || this.props.iconRight) &&
            <Box ml="auto" className="actions">
              { this.props.hasDownloadIcon && this.props.downloadFormats &&
                <IconMenu
                  iconButtonElement={<IconButton><DownloadIcon /></IconButton>}
                  open={this.state.downloadOpen}
                  onRequestChange={this.handleTouchTapDownload}
                  anchorOrigin={{ horizontal: 'left', vertical: 'center' }}
                >
                  {downloadOptions}
                </IconMenu>
              }
              { this.props.iconRight &&
                <span>
                  <IconButton data-tip={this.props.tooltip} data-for="row-header-icon-right-tooltip" touch onTouchTap={this.props.onIconRightClick}>{this.props.iconRight}</IconButton>
                  <ReactTooltip id="row-header-icon-right-tooltip" />
                </span>
              }
              { years.length > 0 &&
                <FlatButton
                  onClick={this.handleTouchTap}
                  label={this.props.selectedYear}
                  labelPosition="before"
                  icon={yearsIcon}
                  data-tip="Jahr auswählen"
                  data-for="tooltip-year-selection"
                />
              }
              { years.length > 0 && <ReactTooltip id="tooltip-year-selection" />}
            </Box>
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
        </Flex>
        {React.Children.toArray(this.props.children)}
      </Wrapper>
    );
  }
}

RowHeader.propTypes = {
  // properties
  children: PropTypes.node,
  iconLeft: PropTypes.node,
  iconRight: PropTypes.node,
  title: PropTypes.node.isRequired,
  isSidebar: PropTypes.bool.isRequired,
  muiTheme: PropTypes.object.isRequired,
  tooltip: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    handleOnActive: PropTypes.func.isRequired,
  })),
  tabsValue: PropTypes.string,
  selectedYear: PropTypes.number,
  selectableYears: PropTypes.number,
  indicators: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    saldo: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  })),
  hasDownloadIcon: PropTypes.bool,
  downloadFormats: PropTypes.array,
  // actions
  onIconLeftClick: PropTypes.func,
  onIconRightClick: PropTypes.func,
  onDownloadIconClick: PropTypes.func,
  onYearSelect: PropTypes.func,
};

RowHeader.defaultProps = {
  isSidebar: false,
};

export default muiThemeable()(RowHeader);
