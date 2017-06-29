import { push } from 'react-router-redux';
import api from './api';

const prefix = '@_UUI';

const LOAD_USER = `${prefix}/LOAD_USER`;
const DESTROY_USER = `${prefix}/DESTROY_USER`;

const ACTIVATE = `${prefix}/ACTIVATE`;
const ACTIVATE_SUCCESS = `${prefix}/ACTIVATE_SUCCESS`;
const ACTIVATE_FAIL = `${prefix}/ACTIVATE_FAIL`;
const REMOVE_ACTIVATION_INFO = `${prefix}/REMOVE_ACTIVATION_INFO`;

const SIGN_IN = `${prefix}/SIGN_IN`;
const SIGN_IN_SUCCESS = `${prefix}/SIGN_IN_SUCCESS`;
const SIGN_IN_FAIL = `${prefix}/SIGN_IN_FAIL`;
const REMOVE_SIGN_IN_INFO = `${prefix}/REMOVE_SIGN_IN_INFO`;

const SIGN_UP = `${prefix}/SIGN_UP`;
const SIGN_UP_SUCCESS = `${prefix}/SIGN_UP_SUCCESS`;
const SIGN_UP_FAIL = `${prefix}/SIGN_UP_FAIL`;
const REMOVE_SIGN_UP_INFO = `${prefix}/REMOVE_SIGN_UP_INFO`;

const SIGN_OUT = `${prefix}/SIGN_OUT`;

/*\
|*| Actions
\*/

export function loadUser(onSuccess, onFail) {
  return api.get(`/user-info`)(
    (result) => {
      const actions = [{ type: LOAD_USER, result }];
      if (onSuccess) {
        actions.push(onSuccess);
      }
      return actions;
    },
    () => {
      window.localStorage.removeItem('token');
      const actions = [{ type: DESTROY_USER }];
      if (onFail) {
        actions.push(onFail);
      }
      return actions;
    }
  );
}

export function activate(token) {
  return [
    { type: ACTIVATE },
    api.get(`/active/${token}`)(
      { type: ACTIVATE_SUCCESS },
      { type: ACTIVATE_FAIL }
    )
  ];
}

export function removeActivationInfo() {
  return { type: REMOVE_ACTIVATION_INFO };
}

export function signIn(em, pw, rp) {
  return [
    { type: SIGN_IN },
    api.post('/login', { userName: em, password: pw })(
      (result) => {
        window.localStorage.setItem('token', result.token);
        if (rp) {
          window.localStorage.setItem('email', em);
          window.localStorage.setItem('password', pw);
        }
        return { type: SIGN_IN_SUCCESS, result };
      },
      signInFail()
    ),
    push('/')
  ];
}

export function signInFail() {
  return { type: SIGN_IN_FAIL };
}

export function removeSigninInfo() {
  return { type: REMOVE_SIGN_IN_INFO };
}

export function signUp(em, pw, rn) {
  return [
    { type: SIGN_UP },
    api.post('/register', { userName: em, password: pw, realName: rn })(
      { type: SIGN_UP_SUCCESS },
      { type: SIGN_UP_FAIL }
    )
  ];
}

export function removeSignupInfo() {
  return { type: REMOVE_SIGN_UP_INFO };
}

export function signOut() {
  window.localStorage.removeItem('token');
  return [
    { type: SIGN_OUT },
    push('/signin')
  ];
}

/*\
|*| Reducers
\*/

export default function (state = {}, action) {
  switch (action.type) {

  case LOAD_USER:
    return {
      ...state,
      user: {
        email: action.result.userName,
        id: action.result.userId,
        groups: action.result.groups,
        tasks: action.result.quests,
        privilege: action.result.userType
      }
    };

  case DESTROY_USER:
    return {
      ...state,
      user: null
    };

  case SIGN_IN_SUCCESS:
    return {
      ...state,
      user: {
        id: action.result.userId,
        email: action.result.userName,
        privilege: action.result.userType
      }
    };

  case SIGN_OUT:
    return {
      ...state,
      user: null
    };

  default:
    return state;
  }
}


const initialState = {
  signingIn: false,
  signingUp: false
};

export function reducerSignIn(state = initialState, action) {
  switch (action.type) {

  case ACTIVATE:
    return {
      ...state,
    };

  case ACTIVATE_SUCCESS:
    return {
      ...state,
      activationSuccessInfo: '您的帐号已激活，请通过下面的登录框登录'
    };

  case ACTIVATE_FAIL:
    return {
      ...state,
      activationFailInfo: action.error.toString()
    };

  case REMOVE_ACTIVATION_INFO:
    return {
      ...state,
      activationSuccessInfo: '',
      activationFailInfo: ''
    };

  case SIGN_IN:
    return {
      ...state,
      signingIn: true
    };

  case SIGN_IN_SUCCESS:
    return {
      ...state,
      signingIn: false
    };

  case SIGN_IN_FAIL:
    return {
      ...state,
      signingIn: false,
      signinFailInfo: action.error ? action.error.toString() : '用户名或密码错误'
    };

  case REMOVE_SIGN_IN_INFO:
    return {
      ...state,
      signinFailInfo: ''
    };

  case SIGN_UP:
    return {
      ...state,
      signingUp: true
    };

  case SIGN_UP_SUCCESS:
    return {
      ...state,
      signingUp: false,
      signupSuccessInfo: '您已注册成功，请登录邮箱激活帐号'
    };

  case SIGN_UP_FAIL:
    return {
      ...state,
      signingUp: false,
      signupFailInfo: action.error.toString()
    };

  case REMOVE_SIGN_UP_INFO:
    return {
      ...state,
      signupSuccessInfo: '',
      signupFailInfo: ''
    };

  default:
    return state;
  }
}
