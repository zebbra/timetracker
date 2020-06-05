import styled from 'styled-components';
import { Flex } from 'grid-styled';
import { iconSize } from 'utils/variables';
import { media } from 'utils/style-helpers';


const Wrapper = styled(Flex)`
  margin-top: 30px;
  font-size: 1.8rem;

  ${media.tablet`height: ${iconSize};`}
`;

export default Wrapper;
