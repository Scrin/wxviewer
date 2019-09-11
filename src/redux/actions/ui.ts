import { SetPassSelection, PassSelection } from '../../types';

export const setPassSelection = (passSelection: PassSelection): SetPassSelection => ({ type: 'SET_PASS_SELECTION', passSelection });
