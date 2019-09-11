import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Header from './Header';
import { State } from '../types';
import { getImageURL, formatPass, loadPassSelectionFromUrl, loadPasses, keyEvent } from '../helpers';
import { setPassSelection } from '../redux/actions';


const Wrapper = styled.div`
    width: 100%;
    height: 100%;
    background-color: black;
`

const Content = styled.div`
    width: 100%;
    height: calc(100% - 60px);
    min-height: 0;
    position: relative;
`

const Img = styled.img`
    max-height: 100%;
    max-width: 100%;
    width: auto;
    height: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
`

export default () => {
    const dispatch = useDispatch();
    const passData = useSelector((state: State) => state.pass.passData);
    const passSelection = useSelector((state: State) => state.ui.passSelection);
    useEffect(() => {
        loadPasses();
        const popstate = () => passData.length > 0 && dispatch(setPassSelection(loadPassSelectionFromUrl(passData)));
        document.addEventListener('keydown', keyEvent, false);
        window.addEventListener('popstate', popstate, false);
        return () => {
            document.removeEventListener('keydown', keyEvent, false);
            window.removeEventListener('popstate', popstate, false);
        }
    }, [dispatch, passData]);

    let image = null;
    if (passSelection.pass && passSelection.enhancement) {
        image = <Img alt={formatPass(passSelection.pass)} src={getImageURL(passSelection.pass, passSelection.enhancement)} />
    }
    return (
        <Wrapper>
            <Header />
            <Content>{image}</Content>
        </Wrapper>
    );
}
