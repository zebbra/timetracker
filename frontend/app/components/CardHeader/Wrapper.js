import styled from 'styled-components';
import { CardHeader } from 'material-ui/Card';
import { MediTheme } from 'utils/theme';

const Wrapper = styled(CardHeader)`
  background-color: ${MediTheme.palette.accent1Color} !important;
  text-align: center;

  > div {
    padding-right: 0 !important;

    > span {
      color: ${MediTheme.palette.alternateTextColor} !important;
    }
  }
`;

export default Wrapper;
