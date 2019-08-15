import { PassData, Enhancement } from "../types";

export const baseUrl = process.env.REACT_APP_BACKEND_BASE_URL || '';

export const formatPassDate = (time: string) => {
    const t = time.match(/.{1,2}/g);
    if (!t || t.length < 7) return time; // YYYYMMDDHHMMSS splits into 7 parts
    return t[0] + t[1] + '-' + t[2] + '-' + t[3];
}

export const formatPassTime = (time: string) => {
    const t = time.match(/.{1,2}/g);
    if (!t || t.length < 7) return time; // YYYYMMDDHHMMSS splits into 7 parts
    return t[4] + ':' + t[5];
}

export const formatPassDateTime = (pass: PassData) => {
    return formatPassDate(pass.start) + ' at ' + formatPassTime(pass.start) + ' - ' + formatPassTime(pass.end);
}

export const formatSatelliteName = (name: string) => {
    if (name.startsWith('noaa-')) {
        return 'NOAA ' + name.substring(5);
    }
    return name;
}

export const formatPass = (pass: PassData) => {
    return formatPassDateTime(pass) + ' (' + formatSatelliteName(pass.satellite) + ')'
}

export const formatEnhancementName = (enhancementName: string) => {
    switch (enhancementName) {
        case 'contrasta': return 'Channel A (contrast enhanced)';
        case 'contrastb': return 'Channel B (contrast enhanced)';
        case 'hvc': return 'HVC false-color';
        case 'hvct': return 'HVC false-color with land/sea colors';
        case 'mcir': return 'MCIR map color IR';
        case 'msa': return 'MSA multispectral analysis';
        case 'pris': return 'Normalized raw image';
        case 'therm': return 'Thermal image';
        default: return enhancementName;
    }
}

export const getImageURL = (pass: PassData, enhancement: Enhancement) => {
    let s = baseUrl + '/images/' + pass.start + '-' + pass.end + '-' + pass.satellite + '/' + pass.start + '-' + pass.end + '-' + pass.satellite + '-' + enhancement.type;
    if (enhancement.precip) s += '-precip';
    if (enhancement.map) s += '-map';
    return s + '.png';
}
