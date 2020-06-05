import styled from 'styled-components';
import { Box } from 'grid-styled';
import { MediTheme } from 'utils/theme';
import cellStyles from './cellStyles';


const HolidayCell = styled(Box)`
  ${cellStyles}
  background-color: ${MediTheme.palette.primary3Color};
  cursor: default;

  > section {
    > .cell-label {
      text-align: center;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: ${MediTheme.palette.accent3Color};
    }
  }
`;

export default HolidayCell;
