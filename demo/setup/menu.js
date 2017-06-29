const ROOT = 1000;
const ADMIN_1 = 101;
const ADMIN_2 = 102;
const ADMIN_3 = 103;
const ADMIN_4 = 104;
const STD = 1;

export default [
  {
    type: 'item',
    name: '用户管理',
    URI: '/users',
    privilege: ADMIN_4
  },

  {
    type: 'submenu',
    name: '个人信息',
    entries: [
      {
        type: 'item',
        name: '修改密码',
        URI: '/password'
      }
    ],
    privilege: STD
  },

  {
    type: 'submenu',
    name: '其他',
    entries: [
      {
        type: 'item',
        name: '开发文档',
        URI: '/docs'
      }
    ]
    // No `privilege` field means everyone has access to it
  },

  {
    type: 'item',
    name: '日志',
    URI: '/log',
    privilege: ROOT,
    pullRight: true
  }
];
