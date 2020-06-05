import { css } from 'styled-components';
import { MediTheme } from 'utils/theme';
import { media } from 'utils/style-helpers';

const cellStyles = css`
  height: 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: text;

  &.column-first {
    border-left: 2px solid rgba(0, 104, 175, 0.2);
  }

  &.column-last {
    border-right: 2px solid rgba(0, 104, 175, 0.2);
  }

  &.element-first {
    border-top: 2px solid rgba(0, 104, 175, 0.2);
  }

  &.element-last {
    border-bottom: 2px solid rgba(0, 104, 175, 0.2);
  }

  &.element-first-last {
    border-top: 2px solid rgba(0, 104, 175, 0.2);
    border-bottom: 2px solid rgba(0, 104, 175, 0.2);
  }

  &:hover {
    background-color: rgba(0, 104, 175, 0.3);
  }

  &.disabled,
  &.closed {
    cursor: default;
    background-color: ${MediTheme.palette.primary3Color};
  }

  &.hidden {
    border: 1px solid rgba(0, 104, 175, 0.3);
    background-color: rgba(0, 104, 175, 0.1);
  }

  &.selected {
    border: 1px solid ${MediTheme.palette.accent1Color};
  }

  > section {
    height: 100%;

    > .cell-label {
      color: ${MediTheme.palette.accent3Color};
      display: flex;
      justify-content: flex-end;
    }

    > .cell-unit {
      color: ${MediTheme.palette.primary1Color};
      ${media.desktop`display: none;`}
    }

    > .cell-value {
      font-weight: 500;
      ${media.desktop`
        text-align: center;
        width: 100%;
      `}
    }
  }
`;

export default cellStyles;
