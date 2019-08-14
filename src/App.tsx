import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Viewer from './components/Viewer';

const GlobalStyle = createGlobalStyle`
    html {
        width: 100%;
        height: 100%;
    }
    body {
        width: 100%;
        height: 100%;
        margin: 0;
    }
    #root {
        width: 100%;
        height: 100%;
    }
`

export default () => (
  <>
    <GlobalStyle />
    <Viewer />
  </>
);
