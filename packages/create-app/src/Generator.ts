import { FeScriptContext } from '@qlover/fe-scripts';
import { Logger } from '@qlover/fe-utils';
import inquirer from 'inquirer';
import { defaultPrompts, packagePrompts } from './prompts';
import { join } from 'path';
import { oraPromise } from 'ora';
import { existsSync } from 'fs';
import { Copyer } from './Copyer';
import { GeneratorOptions, GeneratorPrompt, GeneratorResult } from './type';

export class Generator {
  private ora: typeof oraPromise;
  protected context: FeScriptContext<GeneratorOptions>;
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
  }

  get logger(): Logger {
    return this.context.logger;
  }

  async steps(prompts: GeneratorPrompt[]): Promise<GeneratorResult> {
    try {
      const answers = await inquirer.prompt(prompts);

      return answers as GeneratorResult;
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

  /**
   * Creates files and directories based on the provided template files.
   *
   * This method iterates through the template files and writes their content
   * to the file system. It handles both files and directories, ensuring that
   * the directory structure is preserved.
   *
   * @param result - The result object containing the name and template name.
   *
   * @returns A promise that resolves when all files have been created.
   *
   * @example
   * const result = { name: 'my-app', template: 'react-app' };
   * await this.create(result);
   */
  async create(result: GeneratorResult): Promise<void> {
    // generate target path
    const targetPath = join(process.cwd(), result.name);

    const copyer = new Copyer();

    const options: GeneratorResult = {
      ...result,
      targetPath,
      templateRootPath: this.context.options.templateRootPath
    };

    this.logger.debug(options);

    // return copyer.create(options);
    return copyer.createPromise(options);
  }

  private isPackageTemplate(template: string): boolean {
    return template === 'pack-app';
  }

  async getGeneratorResult(): Promise<GeneratorResult> {
    // const { templatePath } = this.context.options;

    const result = await this.steps(defaultPrompts);

    // if package template, we need to add chooise sub packages type
    if (this.isPackageTemplate(result.template)) {
      const choseSubPackages = await this.steps(packagePrompts);
      Object.assign(result, choseSubPackages);
    }

    return result;
  }

  async generate(): Promise<void> {
    const result = await this.getGeneratorResult();

    await this.action({
      label: 'Creating project',
      task: () => this.create(result)
    });
  }
}
