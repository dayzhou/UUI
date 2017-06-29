import superagent from 'superagent';

function normalizePath(path) {
  if (typeof(path) === "string" && path.length > 0 && path !== '/') {
    return path[0] === '/' ? path : `/${path}`;
  }
  return '/';
}

function normalizeURI(path, prefix) {
  prefix = normalizePath(prefix);
  return (prefix === '/' ? '' : prefix) + normalizePath(path);
}

function makeRequest(uri, method) {
  const token = window.localStorage.token || '';
  const base64token = new Buffer(token).toString('base64');

  return superagent[method](uri)
    .set('Authorization', `Basic ${base64token}:`)
    .type('form');
}

const api = {
  prefix: "",
};

['get', 'post', 'put', 'delete'].forEach((method) => {
  api[method] = (path, data, files) => (successAction, failAction) => {
    path = normalizeURI(path, api.prefix);

    return new Promise((resolve, reject) => {
      const request = makeRequest(path, method);

      switch (method) {
        case 'get':
          if (data) {
            request.query(data);
          }
          break;

        case 'post':
        case 'put':
          if (files) {
            files.forEach((file) => request.attach('file[]', file));
            if (data) {
              Object.keys(data).forEach((key) => {
                request.field(key, data[key]);
              });
            }
          } else if (data) {
            request.send(data);
          }
          break;

        case 'delete':
        default:
          break;
      }

      request.end((err, { body }) => {
        if (!window._PROD_) {
          console.log(`\n>>>> ${path} [${method}]`);
          if (err) {
            console.warn('\n>>>> error:', err);
          }
          console.log(
            `\n>>>> body (status: ${body && body.status}):`,
            (body && body.error) ? '\n  >> error:' : '',
            (body && body.error) || '',
            (body && body.result) ? '\n  >> result:' : '',
            (body && body.result) || ''
          );
          console.log('\n');
        }

        let error, result;
        if (err && !body) {
          error = err;
        } else if (err && body) {
          error = body.error;
        } else if (body && body.status) {
          error = body.error;
        } else {
          result = body.result;
        }

        if (error) {
          if (typeof failAction === 'function') {
            return reject(failAction(error));
          } else if (typeof failAction === 'object') {
            return reject({ ...failAction, error });
          } else if (typeof failAction === 'string') {
            reject({ type: failAction, error });
          } else {
            reject({ type: '@_NO_STATE_CHANGE' });
          }
        } else {
          if (typeof successAction === 'function') {
            return resolve(successAction(result));
          } else if (typeof successAction === 'object') {
            return resolve({ ...successAction, result });
          } else if (typeof successAction === 'string') {
            return resolve({ type: successAction, result });
          } else {
            resolve({ type: '@_NO_STATE_CHANGE' });
          }
        }
      });
    });
  };
});

export default api;
