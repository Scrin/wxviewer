import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import Header from './Header';
import { State } from '../types';
import { getImageURL, formatPass, loadPassSelectionFromUrl, loadPasses, keyEvent } from '../helpers';
import { setPassSelection } from '../redux/actions';
import Drawer from './Drawer';
import Previews from './Previews';


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
    display: flex;
`

const ImageContainer = styled.div`
    width: 100%;
    flex-shrink: 1;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Img = styled.img`
    display: block;
    max-height: 100%;
    max-width: 100%;
    width: auto;
    height: auto;
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
            <Drawer />
            <Content>
                <ImageContainer>{image}</ImageContainer>
                <Previews />
            </Content>
        </Wrapper>
    );
}
