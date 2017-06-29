module.exports = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '8007',

  apiHost: process.env.API_HOST || '127.0.0.1',
  apiPort: process.env.API_PORT || '8080',

  mailServer: process.env.MAIL_SERVER || 'smtp.xxx.com',
  mailPort: process.env.MAIL_PORT || '465',
  mailUser: process.env.MAIL_USER || 'username@xxx.com',
  mailPassword: process.env.MAIL_PASSWORD || 'password'
};
