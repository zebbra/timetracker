import styled from 'styled-components';
import { Box } from 'grid-styled';
import { Tabs } from 'material-ui/Tabs';
import MenuItem from 'material-ui/MenuItem';
import { iconSize } from 'utils/variables';
import { MediTheme } from 'utils/theme';
import { media } from 'utils/style-helpers';


const RowHeader = styled.section`
  flex: 1 0 auto;
  height: ${iconSize};
  width: 100%;
  background-color: ${(props) => props.muiTheme.palette.accent1Color};

  .title > div {
    font-weight: 300 !important;
    color: ${(props) => props.muiTheme.palette.alternateTextColor} !important;
  }

  svg {
    color: ${(props) => props.muiTheme.palette.alternateTextColor} !important;
  }

  &.sidebar {
    background-color: ${(props) => props.muiTheme.palette.primary2Color};

    svg,
    .title > div {
      font-weight: 300 !important;
      color: ${(props) => props.muiTheme.palette.alternateTextColor} !important;
    }
  }

  .actions {
    display: flex;
    align-items: center;

    > button > div > span,
    > button > div > svg {
      color: ${(props) => props.muiTheme.palette.alternateTextColor} !important;
      fill: ${(props) => props.muiTheme.palette.alternateTextColor} !important;
    }
  }
`;

const TabsWrapper = styled(Tabs)`
  > div {
    background-color: ${MediTheme.palette.accent1Color} !important;
    > div {
      background-color: ${MediTheme.palette.primary1Color} !important;
    }
  }

  button {
    padding: 0px 16px !important;
    font-weight: 300 !important;
    text-transform: none !important;
  }
`;

const MenuItemWrapper = styled(MenuItem)`
  &.active {
    background-color: ${MediTheme.palette.accent1Color} !important;
    color: ${MediTheme.palette.alternateTextColor} !important;
  }
`;

const Separator = styled(Box)`
  margin-left: 16px;
  color: ${MediTheme.palette.alternateTextColor};
  font-weight: 100;
  border-left: 1px solid ${MediTheme.palette.alternateTextColor};
  width: 16px;
  height: 45px;
`;

const Indicator = styled(Box)`
  display: none;
  ${media.tablet`display: block;`}

  color: ${MediTheme.palette.alternateTextColor};
  font-weight: 100;
  border-right: 1px solid ${MediTheme.palette.alternateTextColor};
  letter-spacing: 1.2px;

  &:hover {
    cursor: help;
    background-color: rgba(255, 255, 255, 0.1);
  }

  > svg {
    margin-right: 5px;
  }
`;

export default RowHeader;
export {
  TabsWrapper,
  MenuItemWrapper,
  Indicator,
  Separator,
};
