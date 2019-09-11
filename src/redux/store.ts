import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux'
import reducer from './reducers'

const middleware = [];

if (process.env.NODE_ENV !== 'production') {
    middleware.push(createLogger())
}

export default createStore(reducer, applyMiddleware(...middleware));
