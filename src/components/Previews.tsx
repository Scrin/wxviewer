import React from 'react';
import styled from 'styled-components';
import { Hidden } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { State, Enhancement } from '../types';
import { getImageURL, enhancementChange, formatEnhancementName } from '../helpers';
import _ from 'lodash';

const Wrapper = styled.div`
    width: ${(p: { columns: number }) => p.columns * 20}%;
    flex-shrink: 0;
    height: 100%;
    overflow: auto;

    & div {
        width: ${(p: { columns: number }) => 100 / p.columns}%;
    }
`

const Preview = styled.div`
    position: relative;
    float: left;
    cursor: pointer;
`

const Img = styled.img`
    width: 100%;
    display: block;
`

const Name = styled.h3`
    position: absolute;
    margin: 20px;
    text-shadow: 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff, 0 0 8px #fff;
`

export default () => {
    const passSelection = useSelector((state: State) => state.ui.passSelection);
    const pass = passSelection.pass;
    const enhancement = passSelection.enhancement;
    if (!pass || !enhancement) return null;

    const enhancementOpts = _.uniq(pass.enhancements.map(e => e.type)).map(type => {
        let e = pass.enhancements.find(e => e.type === type && e.map === enhancement.map && e.precip === enhancement.precip)
        if (e) return e;
        e = pass.enhancements.find(e => e.type === type && e.map === enhancement.map)
        if (e) return e;
        e = pass.enhancements.find(e => e.type === type && e.precip === enhancement.precip)
        if (e) return e;
        e = pass.enhancements.find(e => e.type === type)
        return e;
    }).filter((e): e is Enhancement => e !== undefined)

    const thumbnails = enhancementOpts.map(e => (
        <Preview onClick={() => enhancementChange(e)}>
            <Name>{formatEnhancementName(e.type)}</Name>
            <Img alt={formatEnhancementName(e.type)} src={getImageURL(pass, e)} />
        </Preview>
    ));
    return (
        <>
            <Hidden mdDown>
                <Wrapper columns={2}>{thumbnails}</Wrapper>
            </Hidden>
            <Hidden smDown lgUp>
                <Wrapper columns={1}>{thumbnails}</Wrapper>
            </Hidden>
        </>
    );
}
