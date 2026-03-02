import { Command } from 'commander';
import { Generator } from './Generator';
import { fetchTemplateList } from './GitHubTemplates';
import type { GeneratorOptions } from './type';
import pkg from '../package.json';

function programArgs() {
  const program = new Command();

  program
    .version(pkg.version, '-v, --version', 'Show version')
    .description(pkg.description)
    .option(
      '-d, --dry-run',
      'Do not touch or write anything, but show the commands'
    )
    .option('-V, --verbose', 'Show more information');

  program.parse();

  return program.opts();
}

export async function main(): Promise<void> {
  const { dryRun, verbose } = programArgs();

  const templateList = await fetchTemplateList();
  if (!templateList?.length) {
    console.error('No templates found from GitHub examples.');
    process.exit(1);
  }

  const options: GeneratorOptions = {
    templateList
  };

  const generator = new Generator({
    dryRun,
    verbose,
    options
  });

  await generator.generate();
}
