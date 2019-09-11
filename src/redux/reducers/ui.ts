import { Action, UiState } from '../../types';

const initialState: UiState = {
    passSelection: {
        pass: null,
        enhancement: null
    }
}

export default (state = initialState, action: Action): UiState => {
    switch (action.type) {
        case 'SET_PASS_SELECTION':
            return { ...state, passSelection: action.passSelection };
        default:
            return state;
    }
}
