import React from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import Directory from './directory';
import SearchBox from './searchBox';
import styles from '../css/main.less';

let PasswordList = CSSModules(({ directories, passwords }) => {
  return (
    <div styleName="password-list">
      <SearchBox />
      <Directory directories={directories} passwords={passwords}/>
    </div>
  )
}, styles);

// const stateToProps;
// const dispatchToProps = () => {
//
// };

PasswordList = connect()(PasswordList);

export default PasswordList;