import styled from 'styled-components';
import { Box } from 'grid-styled';
import { media } from 'utils/style-helpers';
import cellStyles from './cellStyles';


const LabelCell = styled(Box)`
  cursor: default !important;
  ${cellStyles}
  border: none;

  &:hover {
    background-color: transparent;
  }

  > section {
    padding-left: 0 !important;
    padding-right: 5px !important;

    > .cell-label {
      line-height: 14px;
      ${media.desktop`text-align: right;`}
    }
  }
`;

export default LabelCell;
