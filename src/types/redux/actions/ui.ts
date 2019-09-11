import { PassSelection } from '../..';

export interface SetPassSelection {
    type: 'SET_PASS_SELECTION';
    passSelection: PassSelection;
}

export interface ShowDrawer {
    type: 'SHOW_DRAWER';
    show: boolean;
}
