import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import {
  Tabs, Tab, Button, ControlLabel, FormControl, FormGroup, Checkbox
} from 'react-bootstrap';
import {
  activate, removeActivationInfo,
  loadUser, signOut,
  signIn, signInFail, removeSigninInfo,
  signUp, removeSignupInfo
} from '../reducer';
import Alert from './Alert.jsx';

function validateEmail(email) {
  const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}

@connect(
  (state) => ({
    user: state._UUI_.user,
    signingIn: state.app.signingIn,
    signingUp: state.app.signingUp,
    activationSuccessInfo: state.app.activationSuccessInfo,
    activationFailInfo: state.app.activationFailInfo,
  }),
  { activate, removeActivationInfo, signOut, loadUser, push }
)
export default class SignInPage extends Component {
  componentWillMount() {
    const { user } = this.props;
    const { token } = this.props.location.query;
    if (token) {
      if (user) {
        this.props.signOut();
      } else {
        window.localStorage.removeItem('token');
      }
      this.props.activate(token);
    } else {
      if (user) {
        this.props.push('/');
      } else {
        if (window.localStorage.token) {
          this.props.loadUser(push('/'));
        }
      }
    }
  }

  render() {
    const {
      signingIn, signingUp, activationSuccessInfo, activationFailInfo
    } = this.props;

    return (
      <div className="col-md-offset-4 col-md-4">
        <Alert
          type={activationSuccessInfo ? 'success' : 'warning'}
          info={activationSuccessInfo || activationFailInfo}
          close={this.props.removeActivationInfo}
        />

        <Tabs bsStyle="tabs" justified
          id="signin-tabs"
          className="signin-page"
          defaultActiveKey="signin"
        >
          <Tab eventKey="signin" title={<b>登 录</b>} disabled={signingUp}>
            <SignIn />
          </Tab>
          <Tab eventKey="signup" title={<b>注 册</b>} disabled={signingIn}>
            <SignUp />
          </Tab>
        </Tabs>
      </div>
    )
  }
}

@connect(
  (state) => ({
    signingIn: state.app.signingIn,
    signinFailInfo: state.app.signinFailInfo
  }),
  { signIn, removeSigninInfo, signInFail }
)
class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      em: window.localStorage.email || '',
      pw: window.localStorage.password || '',
      rp: false
    };
  }

  handleEmail = (e) => {
    this.setState({ em: e.target.value });
  };

  handlePassword = (e) => {
    this.setState({ pw: e.target.value });
  };

  toggleRememberPassword = (e) => {
    this.setState({ rp: !this.state.rp });
  };

  handleSignin = (e) => {
    e.preventDefault();
    if (!validateEmail(this.state.em) || this.state.pw.length < 8) {
      this.props.signInFail();
    } else {
      this.props.signIn(this.state.em, this.state.pw, this.state.rp);
    }
  };

  render() {
    return (
      <form className="signin-form" onSubmit={this.handleSignin}>
        <Alert
          type="warning"
          info={this.props.signinFailInfo}
          close={this.props.removeSigninInfo}
        />

        <FormGroup>
          <ControlLabel>邮箱</ControlLabel>
          <FormControl type="text"
            value={this.state.em}
            onChange={this.handleEmail}
          />
          <FormControl.Feedback />
        </FormGroup>

        <FormGroup>
          <ControlLabel>密码</ControlLabel>
          <FormControl type="password"
            value={this.state.pw}
            onChange={this.handlePassword}
          />
        </FormGroup>

        <Checkbox onChange={this.toggleRememberPassword} value={this.state.rp}>
          记住密码
        </Checkbox>

        <Button bsStyle="primary"
          type="submit"
          className="btn-lg btn-block"
          onClick={this.handleSignin}
          disabled={this.props.signingIn || !this.state.em || !this.state.pw}
        >
          登录
          { this.props.signingIn &&
            <i className="glyphicon glyphicon-refresh gi-spin" />
          }
        </Button>
      </form>
    );
  }
}

@connect(
  (state) => ({
    signingUp: state.app.signingUp,
    signupSuccessInfo: state.app.signupSuccessInfo,
    signupFailInfo: state.app.signupFailInfo
  }),
  { signUp, removeSignupInfo }
)
class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      em: '',
      pw: '',
      pw2: '',
      rn: ''
    };
  }

  handleEmail = (e) => {
    this.setState({ em: e.target.value });
  };

  handlePassword = (e) => {
    if (e.target.value.length < 8) {
      this.setState({
        pw: e.target.value,
        pwWarning: '（密码长度不少于8个字符）'
      });
    } else {
      this.setState({
        pw: e.target.value,
        pwWarning: ''
      });
    }
  };

  handlePassword2 = (e) => {
    this.setState({ pw2: e.target.value });
  };

  handleRealName = (e) => {
    if (e.target.value.length > 20) {
      this.setState({
        rn: e.target.value,
        rnWarning: '（长度不能超过20个字符）'
      });
    } else {
      this.setState({
        rn: e.target.value,
        rnWarning: ''
      });
    }
  };

  validateSignup = () => {
    if (!validateEmail(this.state.em)) {
      return false;
    }
    if (this.state.pw.length < 8) {
      return false;
    }
    if (this.state.pw2 !== this.state.pw) {
      return false;
    }
    if (!this.state.rn || this.state.rn.length > 20) {
      return false;
    }
    return true;
  };

  handleSignup = (e) => {
    e.preventDefault();
    this.props.signUp(this.state.em, this.state.pw, this.state.rn);
  };

  getEmailValidationState() {
    if (this.state.em) {
      if (validateEmail(this.state.em)) {
        return 'success';
      }
      return 'warning';
    }
  }

  getPasswordValidationState() {
    if (this.state.pw && this.state.pw.length < 8) {
      return 'warning';
    }
  }

  getPasswordValidationState2() {
    if (this.state.pw2) {
      if (this.state.pw2 === this.state.pw) {
        return 'success';
      }
      return 'error';
    }
  }

  getRealNameValidationState() {
    if (this.state.rn && this.state.rn.length > 20) {
      return 'warning';
    }
  }

  render() {
    const { signupSuccessInfo, signupFailInfo, removeSignupInfo } = this.props;

    return (
      <form className="signin-form" onSubmit={this.handleSignup}>
        <Alert
          type={signupSuccessInfo ? 'success' : 'warning'}
          info={signupSuccessInfo || signupFailInfo}
          close={removeSignupInfo}
        />

        <FormGroup validationState={this.getEmailValidationState()}>
          <ControlLabel>邮箱</ControlLabel>
          <FormControl type="text"
            placeholder="例：Json.Bourne@xxx.com"
            value={this.state.em}
            onChange={this.handleEmail}
          />
          <FormControl.Feedback />
        </FormGroup>

        <FormGroup validationState={this.getPasswordValidationState()}>
          <ControlLabel>密码 { this.state.pwWarning }</ControlLabel>
          <FormControl type="password"
            value={this.state.pw}
            onChange={this.handlePassword}
          />
          <FormControl.Feedback />
        </FormGroup>

        <FormGroup validationState={this.getPasswordValidationState2()}>
          <ControlLabel>密码确认</ControlLabel>
          <FormControl type="password"
            value={this.state.pw2}
            onChange={this.handlePassword2}
          />
          <FormControl.Feedback />
        </FormGroup>

        <FormGroup validationState={this.getRealNameValidationState()}>
          <ControlLabel>真实姓名 { this.state.rnWarning }</ControlLabel>
          <FormControl type="text"
            value={this.state.rn}
            onChange={this.handleRealName}
          />
          <FormControl.Feedback />
        </FormGroup>

        <Button bsStyle="primary"
          type="submit"
          className="btn-lg btn-block"
          onClick={this.handleSignup}
          disabled={this.props.signingUp || !this.validateSignup()}
        >
          注册
          { this.props.signingUp &&
            <i className="glyphicon glyphicon-refresh gi-spin" />
          }
        </Button>
      </form>
    );
  }
}
