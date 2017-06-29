import './style.css';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import { reset, resetFail, removeResetInfo } from './reducer';
import UUI from '../../../UUI';

@connect(
  (state) => ({
    resetting: state.app.resetting,
    resetSuccessInfo: state.app.resetSuccessInfo,
    resetFailInfo: state.app.resetFailInfo
  }),
  { reset, resetFail, removeResetInfo }
)
export default class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      opw: '',
      npw: '',
      npw2: ''
    };
  }

  componentWillUnmount() {
    // clear up, especially for ASR revision page!!
  }

  handleOldPassword = (e) => {
    this.setState({ opw: e.target.value });
  };

  handleNewPassword = (e) => {
    if (e.target.value.length < 8) {
      this.setState({
        npw: e.target.value,
        npwWarning: '（密码长度不少于8个字符）'
      });
    } else {
      this.setState({
        npw: e.target.value,
        npwWarning: ''
      });
    }
  };

  getPasswordValidationState() {
    if (this.state.npw && this.state.npw.length < 8) {
      return 'warning';
    }
  }

  handleNewPassword2 = (e) => {
    this.setState({ npw2: e.target.value });
  };

  getPasswordValidationState2() {
    if (this.state.npw2) {
      if (this.state.npw2 === this.state.npw) {
        return 'success';
      }
      return 'error';
    }
  }

  validateSubmission = () => {
    if (this.state.npw.length < 8) {
      return false;
    }
    if (this.state.npw2 !== this.state.npw) {
      return false;
    }
    return true;
  };

  handleSubmission = (e) => {
    e.preventDefault();
    if (this.state.opw.length < 8) {
      this.props.resetFail();
    } else {
      this.props.reset(this.state.opw, this.state.npw);
    }
  };

  render() {
    return (
      <div className="container">
        <div className="page-header">
          <h3>修改密码</h3>
        </div>

        <div className="col-md-6 change-password">
          <UUI.Alert
            type={this.props.resetSuccessInfo ? 'success' : 'warning'}
            info={this.props.resetSuccessInfo || this.props.resetFailInfo}
            close={this.props.removeResetInfo}
          />

          <FormGroup>
            <ControlLabel>当前密码</ControlLabel>
            <FormControl type="password"
              value={this.state.opw}
              onChange={this.handleOldPassword}
            />
          </FormGroup>

          <FormGroup validationState={this.getPasswordValidationState()}>
            <ControlLabel>新密码 { this.state.npwWarning }</ControlLabel>
            <FormControl type="password"
              value={this.state.npw}
              onChange={this.handleNewPassword}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup validationState={this.getPasswordValidationState2()}>
            <ControlLabel>新密码确认</ControlLabel>
            <FormControl type="password"
              value={this.state.npw2}
              onChange={this.handleNewPassword2}
            />
            <FormControl.Feedback />
          </FormGroup>

          <Button bsStyle="primary"
            type="submit"
            onClick={this.handleSubmission}
            disabled={this.props.resetting || !this.validateSubmission()}
          >
            确认
            { this.props.resetting &&
              <i className="glyphicon glyphicon-refresh gi-spin" />
            }
          </Button>
        </div>
      </div>
    );
  }
}
