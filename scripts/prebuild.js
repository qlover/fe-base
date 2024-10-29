import { loadEnv } from '@qlover/fe-scripts/scripts';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadEnv(join(__dirname, '../'));

console.log('Enveronment is', process.env.NODE_ENV);