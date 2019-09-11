import React from 'react';
import { OptionContainer } from './styled';
import { Button } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { State } from '../types';
import { navigatePass, currentPassIndex } from '../helpers';

export const NextPass = () => {
    const passData = useSelector((state: State) => state.pass.passData);
    return (
        <OptionContainer>
            <Button variant="outlined" onClick={(() => navigatePass(1))} disabled={currentPassIndex() >= passData.length - 1}>&gt;</Button>
        </OptionContainer>
    );
}

export const PreviousPass = () => (
    <OptionContainer>
        <Button variant="outlined" onClick={() => navigatePass(-1)} disabled={currentPassIndex() <= 0}>&lt;</Button>
    </OptionContainer>
);
