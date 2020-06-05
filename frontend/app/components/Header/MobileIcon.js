import styled from 'styled-components';
import IconButton from 'material-ui/IconButton';
import { media } from 'utils/style-helpers';


const MobileIcon = styled(IconButton)`
  ${media.tablet`display: none !important;`}
`;

export default MobileIcon;
