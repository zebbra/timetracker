import styled from 'styled-components';
import { Box } from 'grid-styled';
import { media } from 'utils/style-helpers';
import cellStyles from './cellStyles';


const TextCell = styled(Box)`
  ${cellStyles}
  > section {
    > .cell-label {
      ${media.desktop`display: none;`}
    }

    > .cell-value {
      font-weight: 300;
      text-align: left;
    }
  }
`;

export default TextCell;
