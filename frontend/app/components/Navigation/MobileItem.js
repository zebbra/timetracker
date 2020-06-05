import styled from 'styled-components';


const MobileItem = styled.section`
  cursor: pointer;

  > div,
  a {
    color: ${(props) => props.muiTheme.palette.alternateTextColor} !important;
    font-weight: 300 !important;
  }

  &:hover,
  &.active {
    background-color: ${(props) => props.muiTheme.palette.primary2Color};

    > div {
      text-decoration: underline;
    }
  }

`;

export default MobileItem;
