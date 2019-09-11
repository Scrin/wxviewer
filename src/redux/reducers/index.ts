import { combineReducers, Reducer } from 'redux';
import { State } from '../../types';
import pass from './pass';
import ui from './ui';

export default combineReducers({ pass, ui }) as Reducer<State>;
