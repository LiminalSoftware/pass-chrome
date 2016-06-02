import React from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import Directory from './directory';
import styles from '../css/main.less';

const SearchBox = CSSModules(() => {
  return (
    <div styleName="search-box">
      <input placeholder="Search..." type="text"/>
      <button>
        <i className="fa fa-search"></i>
      </button>
    </div>
  )
}, styles);

let PasswordList = CSSModules(({ directories, passwords }) => {
  return (
    <div styleName="password-list">
      <SearchBox />
      <Directory directories={directories} passwords={passwords}/>
    </div>
  )
});

// const stateToProps;
// const dispatchToProps = () => {
//
// };

PasswordList = connect()(PasswordList);

export default PasswordList;