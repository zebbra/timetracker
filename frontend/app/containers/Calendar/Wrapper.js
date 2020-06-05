import styled from 'styled-components';
import { Grid } from 'grid-styled';
import { media } from 'utils/style-helpers';


const ColumnWrapper = styled(Grid)`
  &.label > .region-wrapper {
    display: none;
    ${media.desktop`display: block;`}
  }
`;

export default ColumnWrapper;
