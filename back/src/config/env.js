require('dotenv').config({quiet: true}) 

const env = {
  port: process.env.PORT || 7777,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL,
  mongoUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION,
    refreshSecret: process.env.JWT_REFRESH_SECRET, 
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
  },

  bcryptSalt: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  mail: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },

  routes: {
    verification: process.env.EMAIL_VERIFICATION_URL,
    resetPassword: process.env.PASSWORD_RESET_URL,
  },
  
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  }
};

module.exports = env;