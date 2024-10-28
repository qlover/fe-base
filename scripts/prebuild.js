import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: [join(__dirname, '../.env.local'), join(__dirname, '../.env')]
});

console.log('Enveronment is', process.env.NODE_ENV);
