import React, { Component } from 'react';
import { Alert as _Alert } from 'react-bootstrap';

export default class Alert extends Component {
  render() {
    const { type, info, close } = this.props;
    if (!info) {
      return <div />;
    }

    return (
        <_Alert className="info-bar" bsStyle={type}>
          { close &&
            <button className="close" onClick={close}>
              <i className="glyphicon glyphicon-remove-circle" />
            </button>
          }
          { info }
        </_Alert>
    );
  }
}
