import styled from 'styled-components';
import { List } from 'material-ui/List';
import { MediTheme } from 'utils/theme';


const ListWrapper = styled(List)`
  padding: 0 !important;

  > section {
    &:hover {
      background-color: ${MediTheme.palette.hoverColor};
    }
  }
`;

export default ListWrapper;
