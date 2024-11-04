import { Dependencie } from '../lib';

async function main() {
  const dependencie = new Dependencie();
  await dependencie.checkWithInstall('rimraf', true);
}

main();
