import axios from 'axios';
import { PassData, Enhancement, PassSelection } from "../types";
import { setPassData, setPassSelection } from '../redux/actions';
import { formatSatelliteName, formatPassDateTime } from './formatters';
import store from '../redux/store';

export * from './formatters';
export * from './ui';

export const baseUrl = process.env.REACT_APP_BACKEND_BASE_URL || '';

export const getImageURL = (pass: PassData, enhancement: Enhancement) => {
    let s = baseUrl + '/images/' + pass.start + '-' + pass.end + '-' + pass.satellite + '/' + pass.start + '-' + pass.end + '-' + pass.satellite + '-' + enhancement.type;
    if (enhancement.precip) s += '-precip';
    if (enhancement.map) s += '-map';
    return s + '.webp';
}

export const preloadImages = (passSelection: PassSelection, passData?: Array<PassData>) => {
    if (!passData) passData = store.getState().pass.passData;
    if (!passData) return;
    const oldPassSelection = store.getState().ui.passSelection
    const newPass = passSelection.pass;
    const newEnhancement = passSelection.enhancement;
    const oldPass = oldPassSelection.pass;
    const oldEnhancement = oldPassSelection.enhancement;
    if (newPass && newEnhancement) {
        if (newPass !== oldPass || newEnhancement !== oldEnhancement) {
            // selected pass or enhancement changed, preload "adjacent" passes with the same enhancement
            const i = passData.findIndex(p => p === newPass);
            if (i >= 0) {
                for (let distance = 1; distance <= 2; distance++) {
                    if (i >= distance) new Image().src = getImageURL(passData[i - distance], newEnhancement);
                    if (i < passData.length - distance) new Image().src = getImageURL(passData[i + distance], newEnhancement);
                }
            }
        }
    }
}

export const loadPassSelectionFromUrl = (passData: Array<PassData>): PassSelection => {
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

export const loadPasses = () => {
    if (store.getState().pass.passData.length > 0) return; // already loaded
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
            if (enhancements.length > 0) {
                enhancements.sort(sortEnhancements)
                passData.push({ start: words[0], end: words[1], satellite: words[2], enhancements });
            }
        });
        passData.sort((a, b) => Number(a.start) - Number(b.start));
        const passSelection = loadPassSelectionFromUrl(passData);
        preloadImages(passSelection, passData);
        store.dispatch(setPassData(passData));
        store.dispatch(setPassSelection(passSelection));
        if (passSelection.pass) document.title = formatSatelliteName(passSelection.pass.satellite) + ' on ' + formatPassDateTime(passSelection.pass);
    });
}

const sortEnhancements = (e1: Enhancement, e2: Enhancement): number => {
    const sortValue = (e: Enhancement) => {
        switch (e.type) {
            case "contrasta": return 1;
            case "contrastb": return 2;
            case "hvc": return 3;
            case "hvct": return 4;
            case "mcir": return 5;
            case "therm": return 6;
            case "msa": return 7;
            case "pris": return 8;
            default: return 9;
        }
    }
    return sortValue(e1) - sortValue(e2);
}
