import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import { ViewOptions, PassData, Enhancement } from '../types';
import axios from 'axios';
import { baseUrl, getImageURL, formatPass, formatSatelliteName, formatPassDateTime } from '../helpers';

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

    componentDidMount() {
        document.addEventListener("keydown", e => this.keyEvent(e), false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", e => this.keyEvent(e), false);
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
                    passData={this.state.passData}
                    options={this.state.viewOptions}
                    optionsChange={opts => this.optionsChange(opts)}
                    navigatePass={(direction) => this.navigatePass(direction)}
                    togglePrecip={() => this.togglePrecip()}
                    toggleMap={() => this.toggleMap()}
                />
                <Content>{image}</Content>
            </Wrapper>
        );
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
            passData.sort((a, b) => Number(a.start) - Number(b.start));
            const viewOptions = this.loadViewOptionsFromUrl(passData);
            this.preloadImages(viewOptions, passData);
            this.setState({ viewOptions, passData });
            if (viewOptions.pass) document.title = formatSatelliteName(viewOptions.pass.satellite) + ' on ' + formatPassDateTime(viewOptions.pass);
        });
    }

    loadViewOptionsFromUrl(passData: Array<PassData>): ViewOptions {
        let pass = passData[passData.length - 1];
        let enhancement = pass.enhancements.find(e => e.type === 'msa') || pass.enhancements[0];
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
            document.title = formatSatelliteName(viewOptions.pass.satellite) + ' on ' + formatPassDateTime(viewOptions.pass);
        }
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
                    for (let distance = 1; distance <= 2; distance++) {
                        if (i >= distance) new Image().src = getImageURL(passData[i - distance], enhancement);
                        if (i < passData.length - distance) new Image().src = getImageURL(passData[i + distance], enhancement);
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

    keyEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowUp': return this.navigateEnhancement(-1);
            case 'ArrowDown': return this.navigateEnhancement(1);
            case 'ArrowLeft': return this.navigatePass(-1);
            case 'ArrowRight': return this.navigatePass(1);
            case 'p': return this.togglePrecip();
            case 'm': return this.toggleMap();
            case ' ': return this.setState({ zoom: !this.state.zoom });
        }
    }

    navigatePass(direction: -1 | 1) {
        if (this.state.passData) {
            const index = this.passIndex() + direction;
            if (index < 0 || index >= this.state.passData.length) return;
            this.passChange(this.state.passData[index]);
        }
    }

    navigateEnhancement(direction: -1 | 1) {
        const currentPass = this.state.viewOptions.pass;
        const currentEnhancement = this.state.viewOptions.enhancement;
        if (currentPass && currentEnhancement) {
            let index = this.enhancementIndex();
            while (index >= 0 && index < currentPass.enhancements.length) {
                index += direction;
                if (index < 0 || index >= currentPass.enhancements.length) return;
                // find first enhancement of a different type
                if (currentPass.enhancements[index].type !== currentEnhancement.type) break;
            }
            if (index < 0 || index >= currentPass.enhancements.length) return;
            let enhancement = currentPass.enhancements[index];
            // try to find an enhancement with same precip/map choices
            enhancement = currentPass.enhancements.find(e => e.type === enhancement.type && e.precip === currentEnhancement.precip && e.map === currentEnhancement.map) || enhancement;
            this.enhancementChange(enhancement);
        }
    }

    passChange(pass: PassData) {
        let enhancement = this.state.viewOptions.enhancement;
        // Try to find the same enhancement on the new pass
        enhancement = pass.enhancements.find(e => enhancement && e.type === enhancement.type && e.precip === enhancement.precip && e.map === enhancement.map) || null;
        if (!enhancement) enhancement = pass.enhancements[0];
        this.optionsChange({ ...this.state.viewOptions, pass, enhancement });
    }

    enhancementChange(enhancement: Enhancement) {
        this.optionsChange({ ...this.state.viewOptions, enhancement });
    }

    togglePrecip() {
        if (!this.state.viewOptions.pass) return;
        const enhancement = this.state.viewOptions.pass.enhancements.find(e =>
            this.state.viewOptions.enhancement
            && e.type === this.state.viewOptions.enhancement.type
            && e.precip === !this.state.viewOptions.enhancement.precip
            && e.map === this.state.viewOptions.enhancement.map
        );
        if (enhancement) this.optionsChange({ ...this.state.viewOptions, enhancement });
    }

    toggleMap() {
        if (!this.state.viewOptions.pass) return;
        const enhancement = this.state.viewOptions.pass.enhancements.find(e =>
            this.state.viewOptions.enhancement
            && e.type === this.state.viewOptions.enhancement.type
            && e.precip === this.state.viewOptions.enhancement.precip
            && e.map === !this.state.viewOptions.enhancement.map
        );
        if (enhancement) this.optionsChange({ ...this.state.viewOptions, enhancement });
    }

    passIndex() {
        if (!this.state.passData) return -1;
        return this.state.passData.findIndex(p => p === this.state.viewOptions.pass);
    }

    enhancementIndex() {
        if (!this.state.viewOptions.pass) return -1;
        return this.state.viewOptions.pass.enhancements.findIndex(e => e === this.state.viewOptions.enhancement);
    }
}
