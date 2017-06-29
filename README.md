# Front-End Unified User Interface Boilerplate


本项目意在搭建一个快速的开发模板，希望最终实现的效果是，开发者只需在根目录里新建一个src目录，并在其中继续开发即可，而无需修改该目录之外的代码（当然可能需要写少量ES6/ReactJS的编译配置脚本）。

本项目通过使用`Bootstrap`和`React-Bootstrap`确保风格的统一，浏览器页面上方为菜单栏，菜单栏下方显示具体的页面内容，通过菜单栏可导航到各个主要的页面。所有页面间的跳转通过`React-Router`前端JS库来控制，并通过其提供的`browserHistory`对象来跟踪浏览历史。整个项目不使用服务端渲染，因此没有SEO。

各个标注平台之间的主要差别在于菜单栏和所提供路径（链接到具体页面）的不同。本项目最终实现的效果是，各个平台只需定义各自的菜单和路径配置模块（JS脚本），并将他们作为`Redux` store的初始化参数，本项目提供的`UUI`模块会自动根据配置脚本渲染菜单和访问路径。代码示例如下：

```
import UUI from 'path-to-UUI-module';
import menu from 'path-to-menu-configration-file';
import routes from 'path-to-routes-configration-file';

const store = UUI.createStore({ menu, routes });

ReactDOM.render(
  <Provider store={store}>
    <UUI.UUI title="平台名称" store={store} />
  </Provider>,
  document.getElementById('app')
);
```

这里使用的`UUI.createStore`是`UUI`模块对Redux的createStore封装后的函数，接受参数为store的初始化配置参数。生成的store作为参数传递给`UUI.UUI`组件，则`menu`和`routes`中定义的菜单和路径会被自动生成。`menu`和`routes`的配置脚本格式如下：

```
// menu.js -- exports a menu list

export default [
  {
    type: 'item',  // 独立的菜单项，与之相对应的是'submenu'，即子菜单
    name: '菜单项名称',
    URI: '单击时链接到的路径',  // 缺省则不响应单击事件
    privilege: '数字：只有具有相应权限的用户能看到此菜单项',  // 缺省时则对所有访问者可见
    pullRight: true || false,  // 是否置于菜单栏右侧，缺省为false
  },
  {
    type: 'submenu',  // 子菜单，其下还可以有菜单项，但不能再有子菜单
    name: '子菜单名称',
    entries: [  // 定义子菜单下的菜单项
      {
        type: 'item',
        ...
      },
      ...
    ],
    privilege: ...,
    ...
  },
  ...
];


// routes.jsx -- exports an object of path/page maps

import React from 'react';

export default {
  '/path-name': {
    component: <div />,  // React组件，生成该路径所对应的页面
    reducer: `Redux reducer for /path-name page`,  // 可选
    nonLogin: true || false,  // 是否无需登录即可访问，缺省为false，即必须登录才能访问
  },
  ...
};
```

`routes`的定义中，每个路径下可以有一个`reducer`字段，用来指定进入该页面时Redux store中的旧reducer应当被替换成的新reducer，若缺省则不替换。之所以这样设计的原因是，标注平台的各个页面之间相对独立，需要共享的数据很少，但页面数量却比较多，如果将所有页面的reducer的加载到store中，则应用的状态可能会变的很大，尤其是少部分数据量较大的页面会拖慢其他页面的响应速度，因此在切换页面时可选地替换reducer是比较合理的方案。


## 目录结构

```
root/
|-- README.md
|-- package.json
|-- .babelrc  (babel.js编译配置选项)
|
|-- webpack/
|   |-- demo.config.js  (demo项目的webpack编译配置文件，调用babel.js等)
|   |-- app.config.js  (你自己的项目的webpack配置文件，请根据需要自行修改)
|
|-- static/
|   |-- bootstrap/  (Bootstrap样式文件和字体文件，不含JS脚本)
|   |-- favicon.ico
|   |-- index.html  (HTML5骨架，没有内容)
|   |-- app.js  (webpack编译后生成的最终JS脚本，被index.html引用)
|
|-- UUI/  (生成菜单和路径以及登录页面，保持所有平台的整体风格一致，提供与后端API交互的接口)
|   |-- index.js  (入口)
|   |-- createStore.js  (封装Redux createStore)
|   |-- seqDispatchMiddleware.js  (提供高阶action的Redux middleware)
|   |-- UUI.jsx  (封装路径后对外提供一个接受store对象的React组件)
|   |-- reducer.js  (菜单、路径、用户信息和登录页面的Redux reducer)
|   |-- api.js  (基于seqDispatchMiddleware的提供与API通信功能的HTTP请求对象)
|   |-- components/
|       |-- index.js
|       |-- App.jsx  (生成菜单)
|       |-- SignInPage.jsx  (登录/注册页面)
|       |-- NotFound.jsx  (404错误页面)
|       |-- Alert.jsx  (提示成功/警告/错误消息的组件)
|       |-- DevTools.jsx  (Redux开发调试工具)
|       |-- layout.css  (页面整体样式)
|
|-- demo/  (ES2015/JSX示例代码，展示如何基于UUI模块开发一个单页应用)
    |-- index.js  (生产环境编译入口，提供window._PROD_全局变量)
    |-- app.jsx  (开发环境编译入口)
    |-- config.js  (服务端参数配置脚本)
    |-- server.js  (生产环境node.js服务器)
    |-- devServer.js  (开发环境node.js服务器)
    |
    |-- setup/
    |   |-- index.js
    |   |-- menu.js  (菜单配置脚本)
    |   |-- routes.jsx  (路径配置脚本)
    |
    |-- helpers/  (辅助函数)
    |   |-- sendActivationEmail.js  (提供node.js发送帐号激活邮件的函数)
    |
    |-- pages/
        |-- index.js
        |-- ResetPassword/  (修改密码页面)
            |-- style.css  (样式)
            |-- ResetPassword.jsx  (页面内容)
            |-- reducer.js  (该页面需要使用的reducer)
```


## 开发流程

本项目建议的开发流程是将本模板项目作为上游代码库，以其为基础进行继续开发，并在上游代码更新后在适当的时刻与上游代码同步。具体的步骤如下：

- 下载本项目压缩包到本地，解压缩并将目录名改成你的项目名称

- 进入目录，初始化：
```
git init
```

- 将本项目作为上游代码仓库：
```
git remote add upstream https://gitlab.spetechcular.com/asum/frontend_boilerplate.git
```

- 将你自己的git项目作为主仓库：
```
git remote add origin https://gitlab.spetechcular.com/asum/<your-project-name>.git
```

- 在项目根目录下创建目录`src`，在其中开发你自己项目的代码（可参考`demo`目录下的代码示例）

- 对`webpack/app.config.js`做适当修改以满足你的项目编译需求，我的上游代码不会再改动这个文件

- 如果上游代码有更新，而你需要更新后的功能，可从上游代码仓库获取最新代码（使用`pull`命令须谨慎，以免覆盖你自己的代码）：
```
git pull upstream <your-code-branch>
```


## 部署

本项目的`demo`目录下的代码既用来展示如何调用`UUI`模块提供的功能，也用来展示项目的部署方式。demo目录下的`devServer`和`server`分别为开发模式和生产模式下的node.js服务器脚本，通过`package.json`中定义的命令启动：

- 开发模式：
```
# 如果还没有安装依赖的库，先安装依赖
npm install
# 启动服务器并执行runtime transpilation（当你修改前端代码时，会自动重新transpile，但修改了后端代码则需要重启node.js服务）
npm run dev-demo
```

- 生产模式：
```
npm install
# transpile
npm run build-demo
# 启动服务
npm run start-demo
```

对于你自己的项目，可以相应的调用如下命令（参考`package.json`文件中的`scripts`配置部分）：
```
# transpile your own project
npm run build
# start your own service
npm run start
# start your own development server
npm run dev
```

__**__ 生产服务器和开发服务器的区别 __**__
- 开发服务器会在浏览器`console`中打印与API服务器的交互日志，包括：请求的URI和HTTP方法，返回的数据或错误等等，生产服务器则不会打印这些内容
- 开发服务器使用了`Redux-devtools`来辅助开发，使用`ctrl-s`可调出Redux的action/state monitor等，而生产服务器则将其禁用


## UUI API
