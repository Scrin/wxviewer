import { PassSelection, PassData } from '..';
import { showDrawer } from '../../redux/actions';

export interface State {
    ui: UiState,
    pass: PassState
}

export interface UiState {
    passSelection: PassSelection,
    showDrawer: boolean
}

export interface PassState {
    passData: Array<PassData>
}
