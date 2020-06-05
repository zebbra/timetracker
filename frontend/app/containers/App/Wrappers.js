import styled from 'styled-components';
import { Box } from 'grid-styled';
import { flexContainer, stretchy, column } from 'utils/style-helpers';
import { maxWidth } from 'utils/variables';


const Container = styled(Box)`
  height: 100%;
  max-width: ${maxWidth};
  margin-left: auto;
  margin-right: auto;
  border-left: 1px solid #E0E0E0;
  border-right: 1px solid #E0E0E0;
`;

const AppWrapper = styled.section`
  height: 100%;
  min-height: 100%;
  min-width: 100%;
  background-color: #fafafa;

  ${flexContainer}
  ${column}

  > main {
    ${stretchy}
    ${flexContainer}
    position: relative;

    .sidebar-appear {
      opacity: 0.01;
    }

    .sidebar-appear.sidebar-appear-active {
      opacity: 1;
      transition: opacity .3s ease-in;
    }

    > span > nav {
      width: 20em;
    }

    > article {
      ${stretchy}
    }

    > span > aside {
      width: 28em;
    }
  }
`;

const MainContentWrapper = styled.article`
  z-index: 0;
  overflow-x: hidden !important;
`;

export {
  Container,
  AppWrapper,
  MainContentWrapper,
};
