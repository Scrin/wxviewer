import { SetPassSelection, PassSelection, ShowDrawer } from '../../types';

export const setPassSelection = (passSelection: PassSelection): SetPassSelection => ({ type: 'SET_PASS_SELECTION', passSelection });

export const showDrawer = (show: boolean): ShowDrawer => ({ type: 'SHOW_DRAWER', show });
