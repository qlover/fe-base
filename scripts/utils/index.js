const loadEnv = require('./loadEnv');
const env = require('./env');
const dependency = require('./dependency');

module.exports = {
  ...loadEnv,
  ...env,
  ...dependency
};
