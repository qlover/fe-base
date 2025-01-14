import { FeScriptContext } from '@qlover/fe-scripts';
import { Logger } from '@qlover/fe-utils';
import inquirer, { DistinctQuestion } from 'inquirer';
import defaultPrompts from './prompts';
import { join } from 'path';
import { oraPromise } from 'ora';
import { existsSync } from 'fs';
import { Copyer } from './Copyer';

export type GeneratorOptions = {
  prompts?: DistinctQuestion[];
  templatePath: string;
};

export interface GeneratorResult {
  name: string;
  templateName: string;
}

export type TaskOptions = {
  templateFiles: TemplateFile[];
  result: GeneratorResult;
};

export type TemplateFile = {
  path: string;
  content: string;
};

export class Generator {
  private prompts: DistinctQuestion[] = [];
  private ora: typeof oraPromise;
  protected context: FeScriptContext<GeneratorOptions>;
  constructor(context: Partial<FeScriptContext<GeneratorOptions>>) {
    const templatePath = context.options?.templatePath;

    if (!templatePath) {
      throw new Error('template path not exit');
    }

    // if template path not exit
    if (!existsSync(templatePath)) {
      throw new Error('template path not exit');
    }

    this.ora = oraPromise;
    this.context = new FeScriptContext(context);
    this.prompts = context.options?.prompts || defaultPrompts;
  }

  get logger(): Logger {
    return this.context.logger;
  }

  async steps(prompts: DistinctQuestion[]): Promise<GeneratorResult> {
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

  async getTemplateFiles(path: string): Promise<TemplateFile[]> {
    console.log('jj paths', path);

    return [];
  }

  async action({
    label,
    task
  }: {
    label: string;
    task: () => Promise<unknown>;
  }): Promise<unknown> {
    let awaitTask = task();

    // check run returan a promise
    if (!(awaitTask instanceof Promise)) {
      awaitTask = Promise.resolve(awaitTask);
    }

    const text = label;
    this.ora(awaitTask, text);

    return awaitTask;
  }

  /**
   * Creates files and directories based on the provided template files.
   *
   * This method iterates through the template files and writes their content
   * to the file system. It handles both files and directories, ensuring that
   * the directory structure is preserved.
   *
   * @param templateFiles - An array of template files to be created.
   * @param result - The result object containing the name and template name.
   *
   * @returns A promise that resolves when all files have been created.
   *
   * @example
   * const templateFiles = [{ type: 'file', name: 'example.txt', content: 'Hello World' }];
   * await taskCreate({ templateFiles, result });
   */
  async create(targetPath: string, name: string): Promise<void> {
    const copyer = new Copyer();
    copyer.copyTemplates(targetPath, name, copyer.getIg(targetPath));
  }

  async generate(): Promise<void> {
    const { templatePath } = this.context.options;

    const result = await this.steps(this.prompts);
    this.logger.info(result);

    const targetPath = join(templatePath, result.templateName);

    await this.action({
      label: 'Creating project',
      task: () => this.create(targetPath, result.name)
    });
  }
}
