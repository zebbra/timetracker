import styled from 'styled-components';
import { Flex } from 'grid-styled';
import { MediTheme } from 'utils/theme';

const WeekSaldo = styled(Flex)`
  margin-top: 10px;
  margin-bottom: 15px;

  div > button {
    background-color: ${MediTheme.palette.primary1Color} !important;
    div > span {
      color: white !important;
    }
  }
`;

export default WeekSaldo;
