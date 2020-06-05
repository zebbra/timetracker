import styled from 'styled-components';
import DatePicker from 'material-ui/DatePicker';
import { MediTheme } from 'utils/theme';


const DatePickerWrapper = styled(DatePicker)`
  height: 39px;

  > div {
    height: inherit !important;
    font-size: 12px !important;

    label {
      top: -3px !important;
      transform: none !important;
      transition: none !important;
      font-size: 10px !important;
      width: 100%;
      color: ${MediTheme.palette.accent1Color} !important;
    }

    input {
      margin-top: 7px !important;
    }

    hr {
      top: 36px !important;
    }
  }
`;

export default DatePickerWrapper;
