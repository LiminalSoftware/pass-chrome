import React from 'react';
import { connect } from 'react-redux';

let Directory = ({ directories, passwords }) => {
  let directorySection;
  let passwordSection;
  let nothingMessage;

  if (directories && directories.length > 0) {
    directorySection = directories.map(
      directory => {
        return (
          <li>
            <Directory {...directory} />
          </li>
        )
      }
    )
  }

  if (passwords && passwords.length > 0) {
    passwordSection = passwords.map(
      password => {
        return (
          <li>
            <Password {...password} />
          </li>
        )
      }
    )
  }

  if (!directorySection && !passwordSection) {
    nothingMessage = (
      <li className="nothing">
        Nothing to see here...
      </li>
    )
  }

  return (
    <ul>
      { directorySection }
      { passwordSection }
      { nothingMessage }
    </ul>
  )
};

// Directory = connect()(Directory);

export default Directory;