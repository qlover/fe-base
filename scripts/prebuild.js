import { Env } from '@qlover/fe-scripts';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = new Env({
  rootPath: join(__dirname, '../'),
  log: console
});

env.load();

console.log('Enveronment is', env.getEnvDestroy('NODE_ENV'));
