import React from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { Button, Checkbox } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import _ from 'lodash';
import { ViewOptions, PassData, Enhancement } from '../types';
import { formatPass, formatEnhancementName } from '../helpers';

interface Props {
    passData: Array<PassData> | null,
    options: ViewOptions,
    optionsChange: (opts: ViewOptions) => void,
    navigatePass: (direction: -1 | 1) => void,
    togglePrecip: () => void,
    toggleMap: () => void
}

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

export default class Header extends React.Component<Props> {

    passIndex() {
        if (!this.props.passData) return -1;
        return this.props.passData.findIndex(p => p === this.props.options.pass);
    }

    passChange(pass: PassData) {
        this.props.optionsChange({ ...this.props.options, pass })
    }

    enhancementChange(enhancementType: string) {
        if (!this.props.options.pass) return;
        let enhancement = this.props.options.pass.enhancements.find(e => {
            if (e.type !== enhancementType) return false;
            if (this.props.options.enhancement) return e.precip === this.props.options.enhancement.precip && e.map === this.props.options.enhancement.map;
            return true;
        });
        if (!enhancement) enhancement = this.props.options.pass.enhancements.find(e => e.type === enhancementType);
        if (enhancement) this.props.optionsChange({ ...this.props.options, enhancement })
    }

    render() {
        if (this.props.passData === null) return <Container><TextContainer>Loading satellite passes...</TextContainer></Container>
        let enhancementSelection = null;
        if (this.props.options.pass) {
            const enhancementOpts = _.uniq(this.props.options.pass.enhancements.map(e => e.type));
            const opt = enhancementOpts.find(e => this.props.options.enhancement && this.props.options.enhancement.type === e);
            enhancementSelection = (
                <OptionContainer>
                    <StyledSelect
                        width={400}
                        options={enhancementOpts}
                        value={[opt]}
                        getOptionLabel={formatEnhancementName}
                        getOptionValue={(o: any) => o}
                        onChange={(e: string) => this.enhancementChange(e)}
                    />
                </OptionContainer>
            )
        }
        const enhancementOptions = [];
        if (this.props.options.pass && this.props.options.enhancement) {
            if (this.props.options.pass.enhancements.some((e: Enhancement) => this.props.options.enhancement && this.props.options.enhancement.type === e.type && e.precip)) {
                enhancementOptions.push(
                    <CheckboxContainer key='precip'>
                        <FormControlLabel
                            label='Precipitation'
                            control={<Checkbox color='primary' checked={this.props.options.enhancement.precip} onChange={e => this.props.togglePrecip()} />}
                        />
                    </CheckboxContainer>
                );
            }
            if (this.props.options.pass.enhancements.some((e: Enhancement) => this.props.options.enhancement && this.props.options.enhancement.type === e.type && e.map)) {
                enhancementOptions.push(
                    <CheckboxContainer key='map'>
                        <FormControlLabel
                            label='Map overlay'
                            control={<Checkbox color='primary' checked={this.props.options.enhancement.map} onChange={e => this.props.toggleMap()} />}
                        />
                    </CheckboxContainer>
                );
            }
        }
        return (
            <Container>
                <OptionContainer>
                    <Button variant="outlined" onClick={() => this.props.navigatePass(-1)} disabled={this.passIndex() <= 0}>&lt;</Button>
                </OptionContainer>
                <OptionContainer>
                    <StyledSelect
                        width={400}
                        options={this.props.passData || []}
                        value={(this.props.passData || []).find(p => p === this.props.options.pass)}
                        getOptionLabel={formatPass}
                        getOptionValue={(o: any) => o}
                        onChange={(p: PassData) => this.passChange(p)}
                    />
                </OptionContainer>
                <OptionContainer>
                    <Button variant="outlined" onClick={(() => this.props.navigatePass(1))} disabled={this.passIndex() >= this.props.passData.length - 1}>&gt;</Button>
                </OptionContainer>
                {enhancementSelection}
                {enhancementOptions}
            </Container>
        );
    }
}
