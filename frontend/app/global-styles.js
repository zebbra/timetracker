import { injectGlobal } from 'styled-components';

import { media } from 'utils/style-helpers';
import { DefaultTheme } from 'utils/theme';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  html {
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }

  html,
  body,
  #app,
  #app > section {
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    color: ${DefaultTheme.palette.textColor};
    text-rendering: optimizeLegibility;
    font-size: 12px;
  }

  ${media.highDdpx`
    html {
      font-weight: 300;
    }
  `}

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -ms-overflow-style: scrollbar;
  }

  body.fontLoaded {
    font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  .print {
    margin-bottom: 0px !important;

    h1 { margin: 5px 20px; }
    h2 { margin: 0; }
  }

  .__react_component_tooltip {
    font-weight: 100;
    text-align: left;
    font-size: 12px;
  }

  ::-ms-clear {
    display: none !important;
  }

  #export-content {
    width: 21cm;
    margin: auto;
    padding: 30px 45px;
    font-size: 16px;
    color: #000;

    // header,
    // .sub-table-wrapper {
    //   width: 90%
    //   margin: 20px auto;
    // }

    .sub-table-wrapper {
      padding-bottom: 10px;
    }

    .table-3 {
      padding-top: 55px;
    }
  
    table {
      width: 100%;
      table-layout: auto;
    }
  
    table,
    td,
    th {
      border-collapse: collapse;
    }
  
    th,
    td {
      padding: 4px;
      border: solid 1px;
    }
  
    .column-0-60 {
      width: 60%;
    }

    .column-0 {
      width: 70%;
    }
  
    .column-1,
    .column-2,
    .column-3, {
    .column-4 {
      width: 10%;
      text-align: right;
    }
  }
`;
