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
    passData: Array<PassData> | null,
    zoom: boolean
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
const DefaultImage = styled.img`
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
const ZoomedImage = styled(DefaultImage)`
    object-fit: contain;
    min-width: 100%;
    min-height: 100%;
`

export default class Viewer extends React.Component<Props, State> {

    state: State = {
        viewOptions: {
            pass: null,
            enhancement: null
        },
        passData: null,
        zoom: false
    }

    componentWillMount() {
        this.load();
        window.onpopstate = () => this.state.passData && this.setState({ viewOptions: this.loadViewOptionsFromUrl(this.state.passData) });
    }

    load() {
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
            const viewOptions = this.loadViewOptionsFromUrl(passData);
            this.preloadImages(viewOptions, passData);
            this.setState({ viewOptions, passData });
        });
    }

    loadViewOptionsFromUrl(passData: Array<PassData>): ViewOptions {
        let pass = passData[0];
        let enhancement = passData[0].enhancements.find(e => e.type === 'msa') || passData[0].enhancements[0];
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length === 5) {
            pass = passData.find(p => p.start === pathParts[1] && p.end === pathParts[2] && p.satellite === pathParts[3]) || pass;
            const queryString = new URLSearchParams(window.location.search);
            const precip = queryString.get('precip') === 'true';
            const map = queryString.get('map') === 'true';
            enhancement = pass.enhancements.find(e => e.type === pathParts[4] && e.precip === precip && e.map === map) || enhancement;
        }
        return { pass, enhancement };
    }

    optionsChange(viewOptions: ViewOptions) {
        this.preloadImages(viewOptions);
        this.setState({ viewOptions });
        if (viewOptions.pass && viewOptions.enhancement) {
            let url = '/' + viewOptions.pass.start + '/' + viewOptions.pass.end + '/' + viewOptions.pass.satellite + '/' + viewOptions.enhancement.type;
            const params = new URLSearchParams();
            if (viewOptions.enhancement.precip) {
                params.set('precip', 'true');
            }
            if (viewOptions.enhancement.map) {
                params.set('map', 'true');
            }
            const queryString = params.toString();
            if (queryString !== '') url += '?' + queryString;
            window.history.pushState(null, '', url)
        }
    }

    render() {
        const pass = this.state.viewOptions.pass;
        const enhancement = this.state.viewOptions.enhancement;
        let image = null;
        if (this.state.passData && pass && enhancement) {
            const Image = this.state.zoom ? ZoomedImage : DefaultImage;
            image = <Image alt={formatPass(pass)} src={getImageURL(pass, enhancement)} onClick={() => this.setState({ zoom: !this.state.zoom })} />
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

    preloadImages(viewOptions: ViewOptions, passData: Array<PassData> | null = this.state.passData) {
        if (!passData) return;
        const pass = viewOptions.pass;
        const enhancement = viewOptions.enhancement;
        if (pass && enhancement) {
            if (pass !== this.state.viewOptions.pass || enhancement !== this.state.viewOptions.enhancement) {
                // selected pass or enhancement changed, preload "adjacent" passes with the same enhancement
                const i = passData.findIndex(p => p === pass);
                if (i >= 0) {
                    for (let distance = 0; distance < 2; distance++) {
                        if (i > 0) new Image().src = getImageURL(passData[i - 1], enhancement);
                        if (i < passData.length - 1) new Image().src = getImageURL(passData[i + 1], enhancement);
                        if (i > 1) new Image().src = getImageURL(passData[i - 2], enhancement);
                        if (i < passData.length - 2) new Image().src = getImageURL(passData[i + 2], enhancement);
                    }
                }
            }
            if (pass !== this.state.viewOptions.pass || (this.state.viewOptions.enhancement && this.state.viewOptions.enhancement.type !== enhancement.type)) {
                // pass changed or enhancement changed to a different enhancement type, preload variants (precip, map..)
                pass.enhancements.forEach(e => {
                    if (e !== enhancement && e.type === enhancement.type) new Image().src = getImageURL(pass, e);
                });
            }
        }
    }
}
