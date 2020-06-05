import styled from 'styled-components';


const Wrapper = styled.aside`
  position: absolute;
  right: 0;
  height: 100%;
  z-index: 1;
  background-color: #ffffff;
  border-left: 1px solid ${(props) => props.muiTheme.palette.primary3Color};
  overflow: auto;
`;

export default Wrapper;
