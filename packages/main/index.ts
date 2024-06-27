// import { env } from 'config/app.config.cjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const appConfig = require('../../config/app.config.cjs');

console.log('packages/main env', appConfig.env);
