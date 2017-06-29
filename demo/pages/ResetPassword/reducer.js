import { api } from '../../../UUI';

const prefix = 'RESET_PASSWORD';

const RESET = `${prefix}/RESET`;
const RESET_SUCCESS = `${prefix}/RESET_SUCCESS`;
const RESET_FAIL = `${prefix}/RESET_FAIL`;
const REMOVE_RESET_INFO = `${prefix}/REMOVE_RESET_INFO`;

/*\
|*| Actions
\*/

export function reset(oldPassword, password) {
  return [
    { type: RESET },
    api.post(`/change-password`, { oldPassword, password })(
      { type: RESET_SUCCESS },
      { type: RESET_FAIL }
    )
  ]
}

export function resetFail() {
  return { type: RESET_FAIL };
}

export function removeResetInfo() {
  return { type: REMOVE_RESET_INFO };
}

/*\
|*| export reducer
\*/

const initialState = {
  resetting: false
};

export default function (state = initialState, action) {
  switch (action.type) {

  case RESET:
    return {
      ...state,
      resetting: true
    };

  case RESET_SUCCESS:
    return {
      ...state,
      resetting: false,
      resetSuccessInfo: '重置密码成功'
    };

  case RESET_FAIL:
    return {
      ...state,
      resetting: false,
      resetFailInfo: action.error ? action.error.toString() : '旧密码错误'
    };

  case REMOVE_RESET_INFO:
    return {
      ...state,
      resetSuccessInfo: '',
      resetFailInfo: ''
    };

  default:
    return state;
  }
};
