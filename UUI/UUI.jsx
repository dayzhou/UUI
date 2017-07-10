import React, { Component } from 'react';
import { combineReducers } from 'redux';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Router, IndexRoute, Route } from 'react-router';
import { routerReducer } from 'react-router-redux';
import { App, NotFound, DevTools } from './components';
import UUIreducer, { loadUser } from './reducer';


function routes(store, title, showSignin = true) {
  const requireLogin = (nextState, replace, callback) => {
    const { _UUI_: { user } } = store.getState();
    if (!(user && user.id && user.email)) {
      if (window.localStorage.token) {
        return store.dispatch(loadUser(
          () => callback(),
          () => {
            replace('/signin');
            callback();
          }
        ));
      } else {
        console.log('[INFO] redirect to sign-in page');
        replace('/signin');
      }
    }
    callback();
  };

  const replaceReducer = (reducer) => {
    if (typeof reducer === 'function') {
      store.replaceReducer(combineReducers({
        _UUI_: UUIreducer,
        routing: routerReducer,
        app: reducer
      }));
    }
  };

  const { _UUI_: { routes } } = store.getState();
  const loginRequiredRoutes = Object.entries(routes).filter(
    ([_, { nonLogin }]) => !nonLogin
  );
  const nonLoginRoutes = Object.entries(routes).filter(
    ([_, { nonLogin }]) => nonLogin
  );

  const indexRoute = routes['/']
  const IndexComponent = indexRoute && indexRoute.component;
  const onEnterIndex = indexRoute.nonLogin
    ? () => replaceReducer(indexRoute.reducer)
    : requireLogin;

  return (
    <Route path="/" component={App(title, showSignin)}>
      <IndexRoute component={IndexComponent}
        onEnter={IndexComponent && onEnterIndex}
      />
      <Route onEnter={requireLogin}>{
        loginRequiredRoutes.map(([uri, { component, reducer }], index) =>
          <Route key={index}
            path={uri}
            component={component}
            onEnter={() => replaceReducer(reducer)}
          />
        )
      }</Route>
      { nonLoginRoutes.map(([uri, { component, reducer }], index) =>
          <Route
            key={index}
            path={uri}
            component={component}
            onEnter={() => replaceReducer(reducer)}
          />
        )
      }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
}

export default class UUI extends Component {
  render () {
    const { store, title, hideSignin } = this.props;
    return (
      <div>
        <Router history={browserHistory} children={routes(store, title, !hideSignin)} />
        { !window._PROD_ && <DevTools /> }
      </div>
    );
  }
}
