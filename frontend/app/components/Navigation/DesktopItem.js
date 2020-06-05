import styled from 'styled-components';
import { media } from 'utils/style-helpers';


const DesktopItem = styled.section`
  display: none;
  ${media.tablet`display: inline-block;`}

  height: 48px;
  line-height: 48px;
  text-align: center;
  cursor: pointer;
  font-size: 1.4rem;
  padding: 0 10px;
  color: ${(props) => props.muiTheme.palette.accent1Color};
  font-weight: 300;

  &:hover,
  &.active {
    background-color: ${(props) => props.muiTheme.palette.hoverColor};
  }

  a {
    color: ${(props) => props.muiTheme.palette.accent1Color};
  }

`;

export default DesktopItem;
