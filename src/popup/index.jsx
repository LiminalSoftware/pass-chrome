require('file?name=popup/popup.html!./popup.html');
require('!!style!css!less!../css/font-awesome-4.6.3/font-awesome.less');
require('!!style!css!../css/bootstrap/bootstrap.css');

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './components/app'
import appReducer from './reducers/app'

const store = createStore(appReducer);

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>
  , document.getElementById("root")
);
