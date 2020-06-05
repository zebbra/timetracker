import styled from 'styled-components';
import { MediTheme } from 'utils/theme';


const Wrapper = styled.form`
  > div {
    box-shadow: none !important;
    padding: ${(props) => props.highlight ? '16px' : '0px'};
    background-color: ${(props) => props.highlight ? MediTheme.palette.alternateTextColor : '#fafafa'} !important;
  }

  .Select-menu-outer {
    z-index: 2;
  }

  padding-bottom: 20px;
`;

const Label = styled.section`
  margin-top: 20px;
  margin-bottom: 5px;
  font-size: 15px;
  font-weight: 100;
  color: ${MediTheme.palette.accent1Color};
`;

export default Wrapper;
export {
  Label,
};
