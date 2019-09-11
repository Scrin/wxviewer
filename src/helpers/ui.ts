import { PassSelection, PassData, Enhancement } from '../types';
import store from '../redux/store';
import { preloadImages, formatSatelliteName, formatPassDateTime } from '.';
import { setPassSelection } from '../redux/actions';

export const keyEvent = (event: KeyboardEvent) => {
    switch (event.key) {
        case 'ArrowUp': return navigateEnhancement(-1);
        case 'ArrowDown': return navigateEnhancement(1);
        case 'ArrowLeft': return navigatePass(-1);
        case 'ArrowRight': return navigatePass(1);
        case 'p': return togglePrecip();
        case 'm': return toggleMap();
    }
}

export const currentPassIndex = () => {
    const passData = store.getState().pass.passData;
    if (!passData) return -1;
    const pass = store.getState().ui.passSelection.pass;
    return passData.findIndex(p => p === pass);
}

export const currentEnhancementIndex = () => {
    const passSelection = store.getState().ui.passSelection;
    if (!passSelection.pass) return -1;
    return passSelection.pass.enhancements.findIndex(e => e === passSelection.enhancement);
}

export const passChange = (pass: PassData) => {
    const passSelection = store.getState().ui.passSelection;
    let enhancement = passSelection.enhancement;
    // Try to find the same enhancement on the new pass
    enhancement = pass.enhancements.find(e => enhancement && e.type === enhancement.type && e.precip === enhancement.precip && e.map === enhancement.map) || null;
    if (!enhancement) enhancement = pass.enhancements[0];
    optionsChange({ ...passSelection, pass, enhancement });
}

export const enhancementChange = (enhancement: Enhancement | string) => {
    if (typeof enhancement === 'string') {
        const passSelection = store.getState().ui.passSelection;
        if (!passSelection.pass || !passSelection.enhancement) return;

        const currentEnhancement = passSelection.enhancement;
        const enhancementVariants = passSelection.pass.enhancements.filter(e => e.type === enhancement);

        const sameMap = (e: Enhancement) => e.map === currentEnhancement.map;
        const samePrecip = (e: Enhancement) => e.precip === currentEnhancement.precip;

        let newEnhancement = enhancementVariants.find(e => sameMap(e) && samePrecip(e));
        if (!newEnhancement) newEnhancement = enhancementVariants.find(sameMap);
        if (!newEnhancement) newEnhancement = enhancementVariants.find(samePrecip);
        if (!newEnhancement) newEnhancement = enhancementVariants.find(() => true);
        if (newEnhancement) optionsChange({ ...passSelection, enhancement: newEnhancement })
    } else {
        optionsChange({ ...store.getState().ui.passSelection, enhancement });
    }
}

export const navigatePass = (direction: -1 | 1) => {
    const passData = store.getState().pass.passData;
    if (passData.length > 0) {
        const index = currentPassIndex() + direction;
        if (index < 0 || index >= passData.length) return;
        passChange(passData[index]);
    }
}

export const navigateEnhancement = (direction: -1 | 1) => {
    const passSelection = store.getState().ui.passSelection;
    const currentPass = passSelection.pass;
    const currentEnhancement = passSelection.enhancement;
    if (currentPass && currentEnhancement) {
        let index = currentEnhancementIndex();
        while (index >= 0 && index < currentPass.enhancements.length) {
            index += direction;
            if (index < 0 || index >= currentPass.enhancements.length) return;
            // find first enhancement of a different type
            if (currentPass.enhancements[index].type !== currentEnhancement.type) break;
        }
        if (index < 0 || index >= currentPass.enhancements.length) return;
        enhancementChange(currentPass.enhancements[index].type);
    }
}

export const togglePrecip = () => {
    const passSelection = store.getState().ui.passSelection;
    if (!passSelection.pass) return;
    const enhancement = passSelection.pass.enhancements.find(e =>
        passSelection.enhancement
        && e.type === passSelection.enhancement.type
        && e.precip === !passSelection.enhancement.precip
        && e.map === passSelection.enhancement.map
    );
    if (enhancement) optionsChange({ ...passSelection, enhancement });
}

export const toggleMap = () => {
    const passSelection = store.getState().ui.passSelection;
    if (!passSelection.pass) return;
    const enhancement = passSelection.pass.enhancements.find(e =>
        passSelection.enhancement
        && e.type === passSelection.enhancement.type
        && e.precip === passSelection.enhancement.precip
        && e.map === !passSelection.enhancement.map
    );
    if (enhancement) optionsChange({ ...passSelection, enhancement });
}

const optionsChange = (passSelection: PassSelection) => {
    preloadImages(passSelection);
    store.dispatch(setPassSelection(passSelection));
    if (passSelection.pass && passSelection.enhancement) {
        let url = '/' + passSelection.pass.start + '/' + passSelection.pass.end + '/' + passSelection.pass.satellite + '/' + passSelection.enhancement.type;
        const params = new URLSearchParams();
        if (passSelection.enhancement.precip) {
            params.set('precip', 'true');
        }
        if (passSelection.enhancement.map) {
            params.set('map', 'true');
        }
        const queryString = params.toString();
        if (queryString !== '') url += '?' + queryString;
        window.history.pushState(null, '', url)
        document.title = formatSatelliteName(passSelection.pass.satellite) + ' on ' + formatPassDateTime(passSelection.pass);
    }
}
