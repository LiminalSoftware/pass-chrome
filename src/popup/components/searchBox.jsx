import React from 'react';
// import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import styles from '../css/main.less';
import { Button } from 'react-bootstrap';

const SearchBox = CSSModules(() => {
  return (
    <div styleName="search-box">
      <input placeholder="Search..." type="text"/>
      <Button title="search">
        <i className="fa fa-search"></i>
      </Button>
      <Button title="add">
        <i className="fa fa-plus"></i>
      </Button>
    </div>
  )
}, styles);

export default SearchBox;