const env = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isLocalhost =
      origin.includes("localhost") || origin.includes("127.0.0.1");
    const isLocalNetwork =
      origin.startsWith("http://192.168.") || origin.startsWith("http://10.");

    if (isLocalhost || isLocalNetwork) {
      callback(null, true);
    } else {
      callback(null, true);
    } 
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: [ 
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Headers",
  ],

  credentials: true,

  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
