import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import { ViewOptions, PassData, Enhancement } from '../types';
import axios from 'axios';
import { baseUrl, getImageURL, formatPass } from '../helpers';


interface Props {
}

interface State {
    viewOptions: ViewOptions,
    passData: Array<PassData> | null
}

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
const Image = styled.img`
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
    /* object-fit: contain; */
    /* min-width: 100%; */
    /* min-height: 100%; */
`

export default class Viewer extends React.Component<Props, State> {

    state: State = {
        viewOptions: {
            pass: null,
            enhancement: null
        },
        passData: null
    }

    componentDidMount() {
        axios({ url: baseUrl + '/api/list' }).then(resp => {
            const passData: Array<PassData> = [];
            const lines = resp.data.split(/\r?\n/);
            lines.forEach((line: string) => {
                const words = line.split(/\s+/);
                const enhancements: Array<Enhancement> = [];
                for (let i = 3; i < words.length; i++) {
                    let enhancement = words[i];
                    let map = false;
                    let precip = false;
                    if (enhancement.endsWith('-map')) {
                        map = true;
                        enhancement = enhancement.substring(0, enhancement.length - 4);
                    }
                    if (enhancement.endsWith('-precip')) {
                        precip = true;
                        enhancement = enhancement.substring(0, enhancement.length - 7);
                    }
                    enhancements.push({ type: enhancement, map, precip });
                }
                if (enhancements.length > 0) passData.push({ start: words[0], end: words[1], satellite: words[2], enhancements });
            });
            passData.sort((a, b) => Number(b.start) - Number(a.start));
            this.setState({
                viewOptions: {
                    pass: passData[0],
                    enhancement: passData[0].enhancements.find(e => e.type === 'msa') || null
                }, passData
            });
        });
    }

    optionsChange(viewOptions: ViewOptions) {
        this.setState({ viewOptions });
    }

    render() {
        const pass = this.state.viewOptions.pass;
        const enhancement = this.state.viewOptions.enhancement;
        let image = null;
        if (this.state.passData && pass && enhancement) {
            image = <Image alt={formatPass(pass)} src={getImageURL(pass, enhancement)} />
        }
        return (
            <Wrapper>
                <Header
                    options={this.state.viewOptions}
                    optionsChange={opts => this.optionsChange(opts)}
                    passData={this.state.passData}
                />
                <Content>{image}</Content>
            </Wrapper>
        );
    }
}
