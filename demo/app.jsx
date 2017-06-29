import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import UUI from '../UUI';
import { menu, routes } from './setup';


const store = UUI.createStore({ menu, routes });


ReactDOM.render(
  <Provider store={store}>
    <UUI.UUI title="Demo" store={store} />
  </Provider>,
  document.getElementById('app')
);

export default 0;
