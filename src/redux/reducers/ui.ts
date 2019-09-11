import { Action, UiState } from '../../types';

const initialState: UiState = {
    passSelection: {
        pass: null,
        enhancement: null
    },
    showDrawer: false
}

export default (state = initialState, action: Action): UiState => {
    switch (action.type) {
        case 'SET_PASS_SELECTION':
            return { ...state, passSelection: action.passSelection };
        case 'SHOW_DRAWER':
            return { ...state, showDrawer: action.show };
        default:
            return state;
    }
}
