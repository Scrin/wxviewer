import { PassData, SetPassData } from '../../types';

export const setPassData = (passData: Array<PassData>): SetPassData => ({ type: 'SET_PASS_DATA', passData });
