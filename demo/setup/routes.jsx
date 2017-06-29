import React from 'react';
import {
  reducerResetPassword, ResetPassword
} from '../pages';

const IndexPage = () => (
  <div className="page-header">
    <h1>用户首页</h1>
  </div>
);

export default {
  '/': {
    component: IndexPage
    // default `nonLogin` => false
  },

  '/password': {
    component: ResetPassword,
    reducer: reducerResetPassword
  },

  '/docs': {
    component: () => (<h1>开发文档</h1>),
    nonLogin: true
  }
};
