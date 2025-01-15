import { readJson } from './readJson';

export * from './readJson';

console.log('readJson', readJson('./package.json'));

console.log('process.cwd', process.cwd());
