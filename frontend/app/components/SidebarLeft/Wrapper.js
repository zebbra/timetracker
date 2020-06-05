import styled from 'styled-components';


const Wrapper = styled.nav`
  position: fixed;
  top: 0;
  height: 100%;
  z-index: 1;
  border-right: 1px solid ${(props) => props.muiTheme.palette.primary3Color};
  background-color: ${(props) => props.muiTheme.palette.primary1Color};
`;

export default Wrapper;
