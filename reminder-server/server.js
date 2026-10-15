const mongoose = require('mongoose');
const config = require('./config');
const app = require('./app');

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
  app.listen(config.port, () => {
    console.log(`Server is running on http://localhost:${config.port}`);
  });
}

start();
