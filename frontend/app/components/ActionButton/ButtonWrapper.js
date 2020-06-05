import styled from 'styled-components';
import RaisedButton from 'material-ui/RaisedButton';


const ButtonWrapper = styled(RaisedButton)`
  & button {
    border-radius: 0 !important;

    svg {
      margin-bottom: 4px;
    }
  }

  & span {
    font-weight: 300 !important;
  }
`;

export default ButtonWrapper;
