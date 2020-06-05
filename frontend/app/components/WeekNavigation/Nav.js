import styled from 'styled-components';
import { Box } from 'grid-styled';
import { media } from 'utils/style-helpers';
import { iconSize } from 'utils/variables';
import { MediTheme } from 'utils/theme';


const Nav = styled(Box)`
  text-align: center;

  ${media.tablet`
    text-align: right;
  `}

  > button {
    margin: 0 2px !important;
    height: 35px !important;
    line-height: 32px !important;
    border: 1px solid ${MediTheme.palette.primary1Color} !important;
    min-width: ${iconSize} !important;
  }
`;

export default Nav;

