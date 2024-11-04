import { ScriptsLogger } from '../lib/ScriptsLogger.js';
import { Shell } from '../lib/Shell.js';

async function main() {
  const shell = new Shell({ log: new ScriptsLogger() });
  const result = await shell.run('npm config list', {
    silent: true
  });

  if (!result.includes('//registry.npmjs.org/:_authToken')) {
    await shell.exec(
      `npm config set //registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`
    );
  }
}

main();
