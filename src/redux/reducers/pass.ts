import { Action, PassState } from '../../types';

const initialState: PassState = {
    passData: []
}

export default (state = initialState, action: Action): PassState => {
    switch (action.type) {
        case 'SET_PASS_DATA':
            return { ...state, passData: action.passData };
        default:
            return state;
    }
}
