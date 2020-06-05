import styled from 'styled-components';
import { MediTheme } from 'utils/theme';


const Wrapper = styled.section`
  display: flex;
  justify-content: space-around;
  align-items: center;

  &:hover {
    background-color: ${MediTheme.palette.hoverColor};
  }
`;

export default Wrapper;
