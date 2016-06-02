import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
// import passwordTree from 'passwordTree';

const appReducer = (state = {}, action) => {
  switch (action) {
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  appReducer,
  routing: routerReducer
});

export default rootReducer;