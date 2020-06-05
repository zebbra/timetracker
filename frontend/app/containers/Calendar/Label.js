import styled from 'styled-components';
import { Box } from 'grid-styled';
import { media } from 'utils/style-helpers';
import { MediTheme } from 'utils/theme';


const Label = styled(Box)`
  height: 20px;
  color: ${MediTheme.palette.accent3Color};
  text-align: center;

  display: none;
  ${media.desktop`
    display: block;
  `}
`;

export default Label;
