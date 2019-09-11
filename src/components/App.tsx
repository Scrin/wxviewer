import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Viewer from './Viewer';
import { Provider } from 'react-redux';
import store from '../redux/store';

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
    <Provider store={store}>
        <GlobalStyle />
        <Viewer />
    </Provider>
);
