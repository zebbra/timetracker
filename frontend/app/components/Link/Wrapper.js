import styled from 'styled-components';
import { MediTheme } from 'utils/theme';


const Wrapper = styled.a`
  padding: 0 3px;
  color: ${MediTheme.palette.accent1Color};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    font-weight: 400;
  }
`;

export default Wrapper;
