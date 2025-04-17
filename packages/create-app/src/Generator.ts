import { FeScriptContext } from '@qlover/scripts-context';
import { Logger } from '@qlover/fe-corekit';
import inquirer from 'inquirer';
import { createDefaultPrompts, createPackagePrompts } from './prompts';
import { join } from 'path';
import { oraPromise } from 'ora';
import { existsSync } from 'fs';
import { CopyCallback, Copyer } from './Copyer';
import { GeneratorOptions, GeneratorPrompt, GeneratorContext } from './type';
import { Compose } from './Compose';

const packages = ['pack-app'];
export class Generator {
  private ora: typeof oraPromise;
  protected context: FeScriptContext<GeneratorOptions>;
  private subPackages: string[];
  private copyer: Copyer;
  private compose: Compose;

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
    this.compose = new Compose();
  }

  get logger(): Logger {
    return this.context.logger as unknown as Logger;
  }

  async steps(prompts: GeneratorPrompt[]): Promise<GeneratorContext> {
    try {
      const answers = await inquirer.prompt(prompts);

      return answers as GeneratorContext;
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

  private async getGeneratorContext(): Promise<GeneratorContext> {
    // const { templateRootPath } = this.context.options;
    // get all templates
    const prompts = createDefaultPrompts(this.subPackages, packages);
    const context = await this.steps(prompts);

    // if package template, we need to add chooise sub packages type
    if (this.isPackageTemplate(context.template)) {
      const prompts = createPackagePrompts(this.subPackages);
      const choseSubPackages = await this.steps(prompts);
      Object.assign(context, choseSubPackages);
    }

    // generate target path
    context.targetPath = join(process.cwd(), context.projectName);

    // generate release path
    context.releasePath = context.releasePath || 'src';

    return context;
  }

  async generate(): Promise<void> {
    const context = await this.getGeneratorContext();

    this.logger.debug(
      'context is:',
      context,
      this.context.options.templateRootPath
    );

    // if subPackages is not empty, copy sub packages
    if (context.subPackages) {
      await this.action({
        label: 'Generate Directories(subPackages)',
        task: async () => {
          await this.generateTemplateDir(context);

          await this.generateSubPackages(context);

          await this.generateConfigs(context, context.targetPath!, '_common');
        }
      });

      return;
    }

    await this.action({
      label: 'Generate Directory',
      task: async () => {
        await this.generateTemplateDir(context);
        await this.generateConfigs(context, context.targetPath!, '_common');
        await this.generateConfigs(
          context,
          context.targetPath!,
          context.template
        );
      }
    });
  }

  async generateConfigs(
    context: GeneratorContext,
    targetPath: string,
    configName: string
  ): Promise<void> {
    const copyCallback: CopyCallback = (sourceFilePath, targetFilePath) => {
      this.logger.debug('copyCallback', sourceFilePath, targetFilePath);
      return this.compose.composeConfigFile(
        context,
        sourceFilePath,
        targetFilePath
      );
    };

    const { configsRootPath, config } = this.context.options;

    if (!config) {
      this.logger.debug('no copy config files');
      return;
    }

    await this.copyer.copyPaths({
      sourcePath: join(configsRootPath, configName),
      targetPath,
      copyCallback
    });
  }

  generateTemplateDir(context: GeneratorContext): Promise<void> {
    return this.copyer.copyPaths({
      sourcePath: join(this.context.options.templateRootPath, context.template),
      targetPath: context.targetPath!
    });
  }

  async generateSubPackages(context: GeneratorContext): Promise<void> {
    // if pack template, copy sub packages
    const {
      packagesNames = 'packages',
      subPackages = [],
      targetPath = ''
    } = context;
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
