import React from 'react';
import { Jumbotron, Button } from 'react-bootstrap';

class App extends React.Component {
  render() {
    return (
      <Jumbotron>
        <h1>Jumbotron</h1>
        <p>This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
        <p><Button bsStyle="primary" bsSize="large">Learn more</Button></p>
      </Jumbotron>
    );
  }
}

export default App;