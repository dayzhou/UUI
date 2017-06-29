'use strict';

const config = require('./config');
const sendActivationEmail = require('./helpers/sendActivationEmail');

const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack/demo.config');
webpackConfig.entry.app.unshift(
  `webpack-dev-server/client?http://localhost:${config.port}/`
);
const compiler = Webpack(webpackConfig);

function onProxyRes(proxyRes, req) {
  if (req.url === '/register' && req.method === 'POST') {
    let data = '';

    proxyRes.on('data', (chunk) => {
      data += chunk.toString('binary');
    });

    proxyRes.on('end', () => {
      try {
        data = JSON.parse(data);
        if (typeof data === 'object' && data.status === 0) {
          const addr = req.headers.host;
          const to = data.result.userName;
          const token = data.result.token;
          sendActivationEmail(to, { addr, token });
        }
      } catch (e) {
        console.error('Parsing registration response data error:', e);
      }
    });
  }
}

function onError(error, req, res) {
  let json;
  if (error.code !== 'ECONNRESET') {
    console.error('[Proxy Error]', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
  }

  json = { error: '连接数据库出错，请稍后重试或联系我们', reason: error.message };
  res.end(JSON.stringify(json));
}

const server = new WebpackDevServer(compiler, {
  contentBase: './static',
  historyApiFallback: true,
  hot: true,
  inline: true,
  stats: 'errors-only',
  proxy: {
    '/api': {
      target: `http://${config.apiHost}:${config.apiPort}/`,
      pathRewrite: { '^/api': '' },
      onProxyRes,
      onError
    }
  }
});

server.use(require('morgan')('dev'));

server.listen(config.port, config.host, () => {
  console.log(`Development server running @ ${config.host}:${config.port}`);
});
