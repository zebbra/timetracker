import styled from 'styled-components';
import Snackbar from 'material-ui/Snackbar';
import { MediTheme } from 'utils/theme';

const Wrapper = styled(Snackbar)`
  & > div {
    background-color: ${MediTheme.palette.primary1Color} !important;
    border-radius: 0 !important;
    font-weight: 300;
    text-align: center;
  }
`;

export default Wrapper;
