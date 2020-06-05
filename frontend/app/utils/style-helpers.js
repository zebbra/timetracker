import { css } from 'styled-components';
import { breakpoints } from 'utils/variables';

const sizes = {
  tablet: breakpoints[0],
  desktop: breakpoints[1],
  hd: breakpoints[2],
  huge: breakpoints[3],
};

// Iterate through the sizes and create a media template
const media = Object.keys(sizes).reduce((acc, label) => {
  // eslint-disable-next-line no-param-reassign
  acc[label] = (...args) => css`
    @media screen and (min-width: ${sizes[label]}em) {
      ${css(...args)}
    }
  `;

  return acc;
}, {});

media.highDdpx = (...args) => css`
  @media screen and (-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi), (min-resolution: 1.5dppx) {
    ${css(...args)}
  }
`;

const flexContainer = css`
  display: flex;
  overflow: hidden;

  > * {
    flex: 0 0 auto;
    overflow: auto;
  }
`;

const stretchy = css`
  flex: 1 1 auto;
`;

const column = css`
  flex-direction: column;
`;

export {
  media,
  flexContainer,
  stretchy,
  column,
};
