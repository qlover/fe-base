import fs from 'fs';

export const readJSON = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
