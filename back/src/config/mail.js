const nodemailer = require('nodemailer');
const env = require('./env'); 

const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: false, 
  auth: {
    user: env.mail.user,
    pass: env.mail.pass,
  },
});

module.exports = transporter;