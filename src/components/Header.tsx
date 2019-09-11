import React from 'react';
import styled from 'styled-components';
import { Hidden } from '@material-ui/core';
import { State, PassSelection } from '../types';
import { useSelector } from 'react-redux';
import PassSelector from './PassSelector';
import EnhancementSelector from './EnhancementSelector';
import EnhancementOptions from './EnhancementOptions';
import { TextContainer } from './styled';
import { formatPass, formatEnhancementName } from '../helpers';
import { NextPass, PreviousPass } from './PassNavigation';
import { OpenMenu } from './MenuButton';

const Container = styled.div`
    background-color: #f7f7f7;
    z-index: 100;
    position: relative;
    height: 60px;
    padding: 10px;
    box-sizing: border-box;
`

const currentPass = (passSelection: PassSelection) => {
    if (!passSelection.pass) return null;
    return formatPass(passSelection.pass);
}

const currentEnhancement = (passSelection: PassSelection) => {
    if (!passSelection.enhancement) return null;
    let str = formatEnhancementName(passSelection.enhancement.type);
    if (passSelection.enhancement.precip) str += ', precipitation';
    if (passSelection.enhancement.map) str += ', map';
    return str;
}

export default () => {
    const passData = useSelector((state: State) => state.pass.passData);
    const passSelection = useSelector((state: State) => state.ui.passSelection);

    if (passData.length <= 0) return <Container><TextContainer>Loading satellite passes...</TextContainer></Container>

    return (
        <Container>
            <Hidden mdUp>
                <OpenMenu />
                <TextContainer>{currentPass(passSelection)} - {currentEnhancement(passSelection)}</TextContainer>
            </Hidden>
            <Hidden smDown lgUp>
                <OpenMenu />
                <PreviousPass />
                <PassSelector />
                <NextPass />
                <TextContainer>{currentEnhancement(passSelection)}</TextContainer>
            </Hidden>
            <Hidden mdDown>
                <PreviousPass />
                <PassSelector />
                <NextPass />
                <EnhancementSelector />
                <EnhancementOptions />
            </Hidden>
        </Container>
    );
}
