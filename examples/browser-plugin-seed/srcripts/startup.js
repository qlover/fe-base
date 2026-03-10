const { resolve } = require('path');
const { generateLocales } = require('./generate-locales');
const { main } = require('./patch-jiti');

const relativePath = (path) => resolve(__dirname, path);

main();

generateLocales({
  locales: ['zh', 'en'],
  targetPath: relativePath('../src/assets/locales/{{lng}}.json'),
  sourcePath: relativePath('../shared/config/i18n-identifier')
});
