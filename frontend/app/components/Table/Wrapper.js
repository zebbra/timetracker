import styled from 'styled-components';
import Paper from 'material-ui/Paper';
import MenuItem from 'material-ui/MenuItem';
import { MediTheme } from 'utils/theme';

const TableWrapper = styled.section`
  button {
    border-radius: 0 !important;
  }

  .rt-table {
    flex: 1 0 auto !important;
  }
`;

const HeaderWrapper = styled(Paper)`
  background-color: ${MediTheme.palette.accent1Color} !important;

  .actions {
    display: flex;
    align-items: center;
  }

  > section > div > div {
    color: ${MediTheme.palette.alternateTextColor} !important;
    letter-spacing: 1.2px;
  }

  button {
    svg,
    div > span,
    div > svg {
      color: ${MediTheme.palette.alternateTextColor} !important;
      fill: ${MediTheme.palette.alternateTextColor} !important;
    }
  }
`;

const MenuItemWrapper = styled(MenuItem)`
  &.active {
    background-color: ${MediTheme.palette.accent1Color} !important;
    color: ${MediTheme.palette.alternateTextColor} !important;
  }
`;

const ActionButtons = styled.section`
  text-align: center;
  button {
    padding: 0 !important;
    margin: 0 !important;
    width: 20px !important;
    height: 20px !important;

    svg {
      width: 20px !important;
      height: 20px !important;
    }
  }
`;

export default TableWrapper;

export {
  HeaderWrapper,
  ActionButtons,
  MenuItemWrapper,
};
