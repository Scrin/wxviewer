import React from 'react';
import { useSelector } from 'react-redux';
import { State, Enhancement } from '../types';
import { CheckboxContainer } from './styled';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import { togglePrecip, toggleMap } from '../helpers';

export default () => {
    const passSelection = useSelector((state: State) => state.ui.passSelection);
    if (!passSelection.pass || !passSelection.enhancement) return null;

    const enhancementOptions = [];
    if (passSelection.pass.enhancements.some((e: Enhancement) => passSelection.enhancement && passSelection.enhancement.type === e.type && e.precip)) {
        enhancementOptions.push(
            <CheckboxContainer key='precip'>
                <FormControlLabel
                    label='Precipitation'
                    control={<Checkbox color='primary' checked={passSelection.enhancement.precip} onChange={togglePrecip} />}
                />
            </CheckboxContainer>
        );
    }
    if (passSelection.pass.enhancements.some((e: Enhancement) => passSelection.enhancement && passSelection.enhancement.type === e.type && e.map)) {
        enhancementOptions.push(
            <CheckboxContainer key='map'>
                <FormControlLabel
                    label='Map overlay'
                    control={<Checkbox color='primary' checked={passSelection.enhancement.map} onChange={toggleMap} />}
                />
            </CheckboxContainer>
        );
    }
    return <>{enhancementOptions}</>;
}
