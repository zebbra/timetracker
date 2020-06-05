import styled from 'styled-components';
import { Flex, Box } from 'grid-styled';
import { MediTheme } from 'utils/theme';


const FlexWrapper = styled(Flex)`
  height: 86px;
  color: ${MediTheme.palette.alternateTextColor};
  border-radius: 5px;

  &.red {
    background-color: rgb(247, 93, 129);;
  }

  &.green {
    background-color: rgb(126, 211, 32);;
  }

  &.blue {
    background-color: rgb(66, 165, 246);;
  }

`;

const IconWrapper = styled(Box)`
  background-color: rgba(0, 0, 0, 0.1);
  padding: 12px 0;
  text-align: center;

  > svg {
    color: ${MediTheme.palette.alternateTextColor} !important;
    width: 38px !important;
    height: 38px !important;
  }
`;

const ContentWrapper = styled(Box)`
  padding-left: 10px;
`;

const Saldo = styled.section`
  font-size: 18px;
  line-height: 18px;
  font-weight: 300;
  padding-bottom: 5px;
`;

const Target = styled.section`
  font-weight: 300;
`;

export default FlexWrapper;
export {
  IconWrapper,
  ContentWrapper,
  Saldo,
  Target,
};
