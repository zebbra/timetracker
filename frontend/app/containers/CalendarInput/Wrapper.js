import styled from 'styled-components';
import { Box } from 'grid-styled';
import { MediTheme } from 'utils/theme';


const Wrapper = styled(Box)`
  height: 40px;
  width: 100%;
  border: 1px solid ${MediTheme.palette.accent1Color};
  background-color: rgba(0, 104, 175, 0.1);
`;

const FormWrapper = styled.form`
  > div {
    font-size: 12px !important;
  }

  > div > div,
  input {
    left: 5px;
    width: 95% !important;
  }
`;

export default Wrapper;
export {
  FormWrapper,
};

