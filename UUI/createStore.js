import { createStore, combineReducers, applyMiddleware } from 'redux';
import { browserHistory } from 'react-router';
import {
  syncHistoryWithStore, routerReducer, routerMiddleware
} from 'react-router-redux';
import UUIreducer, { reducerSignIn } from './reducer';
import seqDispatchMiddleware from './seqDispatchMiddleware';
import { SignInPage } from './components';


export default function (UUIsetup) {
  const devTool = window._PROD_
    ? undefined
    : require('./components').DevTools.instrument();

  const reducer = combineReducers({
    _UUI_: UUIreducer,
    routing: routerReducer
  });

  if (typeof UUIsetup !== 'object') {
    throw Error('Application store `setup` must be an object');
  }
  const { routes } = UUIsetup;
  if (typeof routes !== 'object') {
    throw Error('Application `routes` must be an object');
  }
  const initialState = {
    _UUI_: {
      ...UUIsetup,
      routes: {
        '/signin': {
          component: SignInPage,
          reducer: reducerSignIn,
          nonLogin: true
        },
        '/active': {
          component: SignInPage,
          reducer: reducerSignIn,
          nonLogin: true
        },
        ...routes
      }
    }
  };

  const middlewares = [seqDispatchMiddleware, routerMiddleware(browserHistory)];
  const finalCreateStore = applyMiddleware(...middlewares)(createStore);
  const store = finalCreateStore(reducer, initialState, devTool);
  syncHistoryWithStore(browserHistory, store);

  return store;
}
