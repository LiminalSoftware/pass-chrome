require('file?name=popup/popup.html!./popup.html');
require('!!style!css!less!../css/font-awesome-4.6.3/font-awesome.less');
require('!!style!css!../css/bootstrap/bootstrap.css');

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Router, Route, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import App from './components/app'
import Authenticate from './components/authenticate.jsx'
import appReducer from './reducers/app'

const store = createStore(appReducer);
const history = syncHistoryWithStore(hashHistory, store);

ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route path="/" component={App}/>
        <Route path="/auth" component={Authenticate}/>
      </Router>
    </Provider>
  , document.getElementById("root")
);
