import { dirname, join, resolve } from 'path';
import { Command } from 'commander';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { ProjectReflectionGenerater } from '../lib/index.js';
import { Logger } from '@qlover/fe-utils';
const program = new Command();
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  fs.readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

program
  .version(pkg.version)
  .requiredOption('-p, --entryPoints <paths>', 'Entry points', (value) =>
    value.split(',')
  )
  .option(
    '-o, --outputJSONFilePath <path>',
    'Output JSON file path',
    './docs.output/code2md.json'
  )
  .option('-g, --generatePath <path>', 'Generate path', './docs.output')
  .option('--onlyJson', 'Only generate JSON file');

program.parse(process.argv);

const options = program.opts();

const main = async () => {
  const generater = new ProjectReflectionGenerater({
    logger: new Logger({ debug: options.debug }),
    entryPoints: options.entryPoints.map((entry) => resolve(entry)),
    outputJSONFilePath: resolve(options.outputJSONFilePath),
    generatePath: resolve(options.generatePath)
  });

  if (options.onlyJson) {
    await generater.generateJson();
    return;
  }

  await generater.generate();
};

main();
