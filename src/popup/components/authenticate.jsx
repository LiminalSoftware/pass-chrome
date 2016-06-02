import React from 'react';
import CSSModules from 'react-css-modules';
import styles from '../css/authenticate.less';
import { Button } from 'react-bootstrap';

let Authenticate = ()=> {
  return (
    <div styleName="authenticate">
      <label htmlFor="password">Enter your master password:</label>
      <input type="password" name="password"/>
      <Button bsStyle="primary">
        Authenticate
      </Button>
    </div>
  )
};

export default CSSModules(Authenticate, styles);