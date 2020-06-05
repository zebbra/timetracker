import styled from 'styled-components';
import { Flex } from 'grid-styled';
import { MediTheme } from 'utils/theme';


const Wrapper = styled(Flex)`
  background-color: ${MediTheme.palette.primary1Color};
  color: ${MediTheme.palette.alternateTextColor};
  border: 1px solid ${MediTheme.palette.primary2Color};
  height: 48px;

  &.label {
    > section {
      display: none;
    }
    background-color: transparent;
    border: none;
  }
`;

export default Wrapper;
