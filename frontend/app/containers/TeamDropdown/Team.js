import styled from 'styled-components';
import { media } from 'utils/style-helpers';
import { MediTheme } from 'utils/theme';


const Team = styled.div`
  display: none;
  ${media.desktop`display: block`}
  padding-left: 5px;
  cursor: pointer;

  > .team {
    font-size: 1.4rem;
    font-weight: 300;
    color: ${MediTheme.palette.accent1Color};
    text-align: center;
  }
`;

export default Team;
