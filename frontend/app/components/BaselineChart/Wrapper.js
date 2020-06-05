import styled from 'styled-components';
import { Box } from 'grid-styled';
import { MediTheme } from 'utils/theme';


const LegendWrapper = styled(Box)`
  height: 45px;
  border-top: 1px solid ${MediTheme.palette.primary3Color};
  border-bottom: 1px solid ${MediTheme.palette.primary3Color};
  margin-bottom: 10px;
  padding-top: 5px;
`;

const Tracker = styled.section`
  color: ${MediTheme.palette.accent3Color};
`;

export default LegendWrapper;
export {
  Tracker,
};
