import styled from 'styled-components';
import { Flex, Box } from 'grid-styled';
import IconButton from 'material-ui/IconButton';
import { MediTheme } from 'utils/theme';
import { media } from 'utils/style-helpers';


const BoxWrapper = styled(Box)`
  padding: 0 5px;
`;

const Label = styled(Box)`
  font-size: 10px;
  color: ${MediTheme.palette.accent1Color};
  ${media.tablet`text-align: center;`}
`;

const Value = styled(Box)`
  ${media.tablet`text-align: center;`}
`;

const FlexWrapper = styled(Flex)`
  border-left: 1px solid ${MediTheme.palette.primary3Color};
  border-right: 1px solid ${MediTheme.palette.primary3Color};
  border-bottom: 1px solid ${MediTheme.palette.primary3Color};
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  font-size: 16px;

  &.first {
    border-top: 1px solid ${MediTheme.palette.primary3Color};
    border-radius: 5px 5px 0px 0px;
  }

  &.last {
    border-radius: 0px 0px 5px 5px;
  }

  &.first&.last {
    border-radius: 5px 5px 5px 5px;
  }
`;

const SectionWrapper = styled.section`
  margin-bottom: 40px;
`;

const IconButtonWrapper = styled(IconButton)`
  padding: 0px !important;
  height: 32px !important;
  width: 28px !important;
`;

export default BoxWrapper;
export {
  Label,
  Value,
  FlexWrapper,
  SectionWrapper,
  IconButtonWrapper,
};
