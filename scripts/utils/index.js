const loadEnv = require('./loadEnv');
const runCommand = require('./runCommand');
const env = require('./env');
const dependency = require('./dependency');

module.exports = {
  ...loadEnv,
  ...runCommand,
  ...env,
  ...dependency
};
