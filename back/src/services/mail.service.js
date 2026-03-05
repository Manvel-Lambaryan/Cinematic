const transporter = require('../config/mail')
const env = require('../config/env');

const sendWelcomeEmail = async (to, name) => {
  try {
    const mailOptions = {
      from: env.mail.from,
      to: to,
      subject: 'Բարի գալուստ Cinematic!',
      html: `
        <div style="background-color: #141414; color: white; padding: 20px; font-family: sans-serif; text-align: center;">
          <h1 style="color: #e50914;">CinemaTic</h1>
          <h2>Ողջույն, ${name}</h2>
          <p>Շնորհակալություն գրանցվելու համար։ Այժմ կարող եք դիտել լավագույն ֆիլմերը մեր հարթակում։</p>
          <a href="${env.clientUrl}" style="background-color: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Անցնել կայք</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Նամակը հաջողությամբ ուղարկվեց: ${to}`);
  } catch (error) {
    console.error('❌ Նամակի սխալ:', error.message);
  }
};

module.exports = { sendWelcomeEmail };