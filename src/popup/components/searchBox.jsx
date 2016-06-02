import React from 'react';
// import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from '../css/main.less';

const SearchBox = CSSModules(() => {
  return (
    <div styleName="search-box">
      <input placeholder="Search..." type="text"/>
      <button title="search">
        <i className="fa fa-search"></i>
      </button>
      <button title="add">
        <i className="fa fa-plus"></i>
      </button>
    </div>
  )
}, styles);

export default SearchBox;