import React from 'react';
import { useDispatch } from 'react-redux';
import { showDrawer } from '../redux/actions';
import { OptionContainer } from './styled';
import { Button } from '@material-ui/core';

export const OpenMenu = () => {
    const dispatch = useDispatch();
    return (
        <OptionContainer>
            <Button variant="outlined" onClick={() => dispatch(showDrawer(true))}>Menu</Button>
        </OptionContainer>
    );
}

export const CloseMenu = () => {
    const dispatch = useDispatch();
    return (
        <OptionContainer>
            <Button variant="outlined" onClick={() => dispatch(showDrawer(false))}>Close</Button>
        </OptionContainer>
    );
}
