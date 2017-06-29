'use strict';

const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.mailServer,
  port: config.mailPort,
  secure: false,
  requireTLS: true,  //Force TLS
  tls: { rejectUnauthorized: false },
  auth: {
    user: config.mailUser,
    pass: config.mailPassword
  },
});

function mailOptions(to, addr, token) {
  const url = `http://${addr}/active?token=${token}`;
  return {
    from: '"思必驰数据标注平台" <aispeech.com>',
    to,
    subject: '思必驰数据标注平台帐号激活',
    html: (
      '<p>您好！您已成功注册思必驰数据标注平台帐号，请点击下面的链接激活您的帐号。</p>' +
      `<br/><p><a href="${url}" target="_blank">${url}</a></p>` +
      '<br/>--<p>思必驰数据标注平台</p>'
    )
  };
}

module.exports = function (to, options) {
  transporter.sendMail(
    mailOptions(to, options.addr, options.token),
    (error, info) => {
      if (error) {
        console.error('[Send Email Error]', error);
      } else {
        console.log('[Send Email Success]', info);
      }
    }
  );
};
