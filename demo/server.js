'use strict';

const path = require('path');
const Express = require('express');
const httpProxy = require('http-proxy');
const logger = require('morgan');
const favicon = require('serve-favicon');
const historyApiFallback = require('connect-history-api-fallback');

const config = require('./config');
const sendActivationEmail = require('./helpers/sendActivationEmail');

const app = new Express();
const proxy = httpProxy.createProxyServer({
  target: `http://${config.apiHost}:${config.apiPort}/`,
  changeOrigin: true,
  ws: false
});

app.use(logger('dev'));
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));

// This line must be placed ahead of the `app.use('/', ...)` line
app.use('/api', (req, res) => {
  proxy.web(req, res);
});


// Redirects all physically non-existent paths back to the index page
// and let the front-end SPA handle them
app.use(historyApiFallback());
// Serve the index page
app.use('/', Express.static(path.join(__dirname, '..', 'static')));

/*\
|*| Proxy listens on `error` and `proxyRes` events
\*/

proxy.on('error', (error, req, res) => {
  let json;
  if (error.code !== 'ECONNRESET') {
    console.error('[Proxy Error]', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
  }

  json = { error: '连接数据库出错，请稍后重试或联系我们', reason: error.message };
  res.end(JSON.stringify(json));
});

// Only listens to then registration response and
// sends activation emails on successful registration
proxy.on('proxyRes', (proxyRes, req) => {
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
});

/*\
|*| Server starts listening
\*/

app.listen(config.port, config.host, () => {
  console.log(`Production server running @ ${config.host}:${config.port}`);
});
