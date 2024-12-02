import { Dependencie } from '../lib/Dependencie.js';

async function main() {
  const dependencie = new Dependencie();
  await dependencie.checkWithInstall('rimraf', true);
}

main();
