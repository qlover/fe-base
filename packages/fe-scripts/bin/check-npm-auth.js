import { checkNpmAuth } from '../scripts/check-npm.js';

async function main() {
  await checkNpmAuth();
}

main();
