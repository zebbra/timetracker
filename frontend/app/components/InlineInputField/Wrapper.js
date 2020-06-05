import styled from 'styled-components';
import TextField from 'material-ui/TextField';
import { media } from 'utils/style-helpers';


const TextFieldWrapper = styled(TextField)`
  height: 39px !important;

  > label {
    top: -3px !important;
    transform: none !important;
    transition: none !important;
    font-size: 10px !important;
    width: 100%;
    ${media.tablet`text-align: center;`}
  }

  > input {
    ${media.tablet`text-align: center;`}
    margin-top: 7px !important;
  }

  hr {
    top: 36px !important;
  }
`;

export default TextFieldWrapper;
