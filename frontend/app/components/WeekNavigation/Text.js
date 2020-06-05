import styled from 'styled-components';
import { Box } from 'grid-styled';
import { media } from 'utils/style-helpers';


const Text = styled(Box)`
  text-align: center;
  margin-bottom: 10px;

  ${media.tablet`
    margin-bottom: 0px;
    text-align: left;
  `}

  > .week {
    font-weight: 500;
    margin-right: 5px;
  }

  > .week-connector {
    margin: 0 5px;
  }
`;

export default Text;

