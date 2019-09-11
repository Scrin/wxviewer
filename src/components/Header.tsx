import React from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { Button, Checkbox } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import _ from 'lodash';
import { PassData, Enhancement, State, PassSelection } from '../types';
import { formatPass, formatEnhancementName, enhancementChange, togglePrecip, toggleMap, navigatePass, currentPassIndex, passChange } from '../helpers';
import { useSelector } from 'react-redux';

const Container = styled.div`
    background-color: #f7f7f7;
    z-index: 100;
    position: relative;
    height: 60px;
    padding: 10px;
    box-sizing: border-box;
`

const OptionContainer = styled.div`
    margin-right: 16px;
    float: left;
`

const CheckboxContainer = styled(OptionContainer)`
    margin-right: 0;
`

const TextContainer = styled.span`
    display: block;
    padding: 9px;
    font-size: 1rem;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: 0.00938rem;
`

const StyledSelect = styled(Select)`
    width: ${props => props.width}px;
`

const passSelector = (passData: Array<PassData>, passSelection: PassSelection) => (
    <>
        <OptionContainer>
            <Button variant="outlined" onClick={() => navigatePass(-1)} disabled={currentPassIndex() <= 0}>&lt;</Button>
        </OptionContainer>
        <OptionContainer>
            <StyledSelect
                width={400}
                options={Array.from(passData).reverse()}
                value={passData.find(p => p === passSelection.pass)}
                getOptionLabel={formatPass}
                getOptionValue={(o: any) => o}
                onChange={(p: PassData) => passChange(p)}
            />
        </OptionContainer>
        <OptionContainer>
            <Button variant="outlined" onClick={(() => navigatePass(1))} disabled={currentPassIndex() >= passData.length - 1}>&gt;</Button>
        </OptionContainer>
    </>
)

const enhancementSelector = (passSelection: PassSelection) => {
    if (!passSelection.pass) return null;

    const enhancementOpts = _.uniq(passSelection.pass.enhancements.map(e => e.type));
    const opt = enhancementOpts.find(e => passSelection.enhancement && passSelection.enhancement.type === e);
    return (
        <OptionContainer>
            <StyledSelect
                width={400}
                options={enhancementOpts}
                value={[opt]}
                getOptionLabel={formatEnhancementName}
                getOptionValue={(o: any) => o}
                onChange={(e: string) => enhancementChange(e)}
            />
        </OptionContainer>
    )
}

const enhancementOptions = (passSelection: PassSelection) => {
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
    return enhancementOptions;
}

export default () => {
    const passData = useSelector((state: State) => state.pass.passData);
    const passSelection = useSelector((state: State) => state.ui.passSelection);

    if (passData.length <= 0) return <Container><TextContainer>Loading satellite passes...</TextContainer></Container>

    return (
        <Container>
            {passSelector(passData, passSelection)}
            {enhancementSelector(passSelection)}
            {enhancementOptions(passSelection)}
        </Container>
    );
}
