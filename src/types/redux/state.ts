import { PassSelection, PassData } from '..';

export interface State {
    ui: UiState,
    pass: PassState
}

export interface UiState {
    passSelection: PassSelection
}

export interface PassState {
    passData: Array<PassData>
}
