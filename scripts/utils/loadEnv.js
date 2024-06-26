const dotenv = require('dotenv');
const { existsSync } = require('fs');
const path = require('path');

function loadEnv(rootPath = __dirname) {
  const envLocalPath = path.resolve(rootPath, '.env.local');
  const envPath = path.resolve(rootPath, '.env');

  if (existsSync(envLocalPath)) {
    console.log('Loading .env.local file...');
    dotenv.config({ path: envLocalPath });
  } else if (existsSync(envPath)) {
    console.log('Loading .env file...');
    dotenv.config({ path: envPath });
  } else {
    console.warn('No .env.local or .env file found');
  }
}

module.exports = { loadEnv };
