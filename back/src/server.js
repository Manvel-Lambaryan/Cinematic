const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(env.port, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();