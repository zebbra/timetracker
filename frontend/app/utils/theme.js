import {
  cyan500, cyan700, pinkA200, red900,
  grey100, grey300, grey400, grey500, grey600,
  white, darkBlack, fullBlack,
} from 'material-ui/styles/colors';
import { fade } from 'material-ui/utils/colorManipulator';
import spacing from 'material-ui/styles/spacing';

const redMedi = '#E1023D';
const blueMedi = '#0068AF';
const hoverColor = 'rgba(0, 0, 0, 0.1)';

const MediTheme = {
  spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: redMedi,
    primary2Color: red900,
    primary3Color: grey300,
    accent1Color: blueMedi,
    accent2Color: grey100,
    accent3Color: grey600,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.7),
    shadowColor: fullBlack,
    hoverColor,
  },
  datePicker: {
    headerColor: redMedi,
  },
  svgIcon: {
    color: blueMedi,
  },
  toolbar: {
    backgroundColor: grey300,
    height: '48px',
  },
};

const DefaultTheme = {
  spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: cyan500,
    primary2Color: cyan700,
    primary3Color: grey400,
    accent1Color: pinkA200,
    accent2Color: grey100,
    accent3Color: grey500,
    textColor: darkBlack,
    alternateTextColor: white,
    canvasColor: white,
    borderColor: grey300,
    disabledColor: fade(darkBlack, 0.3),
    pickerHeaderColor: cyan500,
    clockCircleColor: fade(darkBlack, 0.07),
    shadowColor: fullBlack,
  },
  svgIcon: {
    color: grey500,
  },
  toolbar: {
    height: '48px',
  },
};

const loadTheme = (type) => {
  switch (type) {
    case 'default': return DefaultTheme;
    case 'medi': return MediTheme;
    default: return DefaultTheme;
  }
};

export default loadTheme;
export {
  DefaultTheme,
  MediTheme,
  loadTheme,
};
