import { PassData } from '../..';

export interface SetPassData {
    type: 'SET_PASS_DATA';
    passData: Array<PassData>;
}
