import { FeScriptContext } from '@qlover/scripts-context';
import { Logger } from '@qlover/fe-utils';
import inquirer from 'inquirer';
import { createDefaultPrompts, createPackagePrompts } from './prompts';
import { join } from 'path';
import { oraPromise } from 'ora';
import { existsSync } from 'fs';
import { CopyCallback, Copyer } from './Copyer';
import { GeneratorOptions, GeneratorPrompt, GeneratorRuntimes } from './type';

const packages = ['pack-app'];
export class Generator {
  private ora: typeof oraPromise;
  protected context: FeScriptContext<GeneratorOptions>;
  private subPackages: string[];
  private copyer: Copyer;

  constructor(context: Partial<FeScriptContext<GeneratorOptions>>) {
    const templatePath = context.options?.templateRootPath;

    if (!templatePath) {
      throw new Error('template path not exit');
    }

    // if template path not exit
    if (!existsSync(templatePath)) {
      throw new Error('template path not exit');
    }

    this.ora = oraPromise;
    this.context = new FeScriptContext(context);
    // this.prompts = context.options?.prompts || defaultPrompts;
    this.subPackages = ['node-lib', 'react-app'];

    // use _common as ignore target path
    this.copyer = new Copyer(
      join(this.context.options.configsRootPath, '_common')
    );
  }

  get logger(): Logger {
    return this.context.logger;
  }

  async steps(prompts: GeneratorPrompt[]): Promise<GeneratorRuntimes> {
    try {
      const answers = await inquirer.prompt(prompts);

      return answers as GeneratorRuntimes;
    } catch (error) {
      if ((error as Record<string, boolean>).isTtyError) {
        // Prompt couldn't be rendered in the current environment
      }

      this.logger.error(error);
      throw error;
    }
  }

  async action({
    label,
    task
  }: {
    label: string;
    task: (() => Promise<unknown>) | (() => unknown);
  }): Promise<unknown> {
    let awaitTask = task();

    // check run returan a promise
    if (!(awaitTask instanceof Promise)) {
      awaitTask = Promise.resolve(awaitTask);
    }

    const text = label;
    this.ora(awaitTask as Promise<unknown>, text);

    return awaitTask;
  }

  private isPackageTemplate(template: string): boolean {
    return packages.includes(template);
  }

  private async getGeneratorResult(): Promise<GeneratorRuntimes> {
    // const { templateRootPath } = this.context.options;
    // get all templates
    const prompts = createDefaultPrompts(this.subPackages, packages);
    const result = await this.steps(prompts);

    // if package template, we need to add chooise sub packages type
    if (this.isPackageTemplate(result.template)) {
      const prompts = createPackagePrompts(this.subPackages);
      const choseSubPackages = await this.steps(prompts);
      Object.assign(result, choseSubPackages);
    }

    return result;
  }

  private async copyConfigs(
    targetPath: string,
    configName: string
  ): Promise<void> {
    const copyCallback: CopyCallback = (sourceFilePath, targetFilePath) => {
      // FIXME: 可以覆盖指定文件或修复复制行为
      this.logger.debug('copyCallback', sourceFilePath, targetFilePath);
      return false;
    };

    const { configsRootPath } = this.context.options;
    await this.copyer.copyPaths({
      sourcePath: join(configsRootPath, configName),
      targetPath,
      copyCallback
    });
  }

  async generate(): Promise<void> {
    const result = await this.getGeneratorResult();

    // generate target path
    result.targetPath = join(process.cwd(), result.name);

    this.logger.debug(
      'result is:',
      result,
      this.context.options.templateRootPath
    );

    // if subPackages is not empty, copy sub packages
    if (result.subPackages) {
      await this.action({
        label: 'Generate Directories(subPackages)',
        task: async () => {
          await this.generateTemplateDir(result);

          await this.generateSubPackages(result);

          await this.copyConfigs(result.targetPath!, '_common');
        }
      });

      return;
    }

    await this.action({
      label: 'Generate Directory',
      task: async () => {
        await this.generateTemplateDir(result);
        await this.copyConfigs(result.targetPath!, '_common');
        await this.copyConfigs(result.targetPath!, result.template);
      }
    });
  }

  private generateTemplateDir(result: GeneratorRuntimes): Promise<void> {
    return this.copyer.copyPaths({
      sourcePath: join(this.context.options.templateRootPath, result.template),
      targetPath: result.targetPath!
    });
  }

  private async generateSubPackages(result: GeneratorRuntimes): Promise<void> {
    // if pack template, copy sub packages
    const {
      packagesNames = 'packages',
      subPackages = [],
      targetPath = ''
    } = result;
    const { templateRootPath } = this.context.options;

    for (const subPackage of subPackages) {
      const sourePath = join(templateRootPath, subPackage);
      const packagesPath = join(targetPath, packagesNames, subPackage);

      this.logger.debug('copy sub package', sourePath, packagesPath);

      await this.copyer.copyPaths({
        sourcePath: sourePath,
        targetPath: packagesPath
      });
    }
  }
}
