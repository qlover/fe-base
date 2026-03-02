import type { LoggerInterface } from '@qlover/logger';
import { ScriptContext } from '@qlover/scripts-context';
import inquirer from 'inquirer';
import { createDefaultPrompts } from './prompts';
import { join } from 'path';
import { oraPromise } from 'ora';
import { Copyer } from './Copyer';
import {
  type GeneratorOptions,
  type GeneratorPrompt,
  type GeneratorContext
} from './type';
import { downloadTemplate } from './GitHubTemplates';
import { existsSync } from 'fs';

export class Generator {
  private ora: typeof oraPromise;
  protected context: ScriptContext<GeneratorOptions>;
  private templateList: string[];
  private copyer: Copyer;

  constructor(context: Partial<ScriptContext<GeneratorOptions>>) {
    this.ora = oraPromise;
    this.context = new ScriptContext('create-app', context);

    this.templateList = this.context.options.templateList ?? [];
    this.copyer = new Copyer();
  }

  public get logger(): LoggerInterface {
    return this.context.logger;
  }

  public async steps(prompts: GeneratorPrompt[]): Promise<GeneratorContext> {
    try {
      const answers = await inquirer.prompt(prompts);

      return answers as GeneratorContext;
    } catch (error) {
      if ((error as Record<string, boolean>).isTtyError) {
        // Prompt couldn't be rendered in the current environment
      }
      // User cancelled with Ctrl+C – do not log, rethrow for graceful exit
      if ((error as Error).name === 'ExitPromptError') {
        throw error;
      }

      this.logger.error(error);
      throw error;
    }
  }

  public async action({
    label,
    task
  }: {
    label: string;
    task: (() => Promise<unknown>) | (() => unknown);
  }): Promise<unknown> {
    let awaitTask = task();

    if (!(awaitTask instanceof Promise)) {
      awaitTask = Promise.resolve(awaitTask);
    }

    const text = label;
    this.ora(awaitTask as Promise<unknown>, text);

    return awaitTask;
  }

  private async getGeneratorContext(): Promise<GeneratorContext> {
    const prompts = createDefaultPrompts(this.templateList);
    const context = await this.steps(prompts);

    context.targetPath = join(process.cwd(), context.projectName);

    return context;
  }

  public async generate(): Promise<void> {
    const context = await this.getGeneratorContext();

    this.logger.debug('context is:', context);

    if (existsSync(context.targetPath!)) {
      throw new Error(
        `The directory already exists: ${context.targetPath}. Please choose another project name or remove the existing directory.`
      );
    }

    await this.action({
      label: 'Generate Directory',
      task: async () => {
        await this.generateTemplateDir(context);
      }
    });
  }

  public async generateTemplateDir(context: GeneratorContext): Promise<void> {
    const { templatePath, cleanup } = await downloadTemplate(context.template);
    try {
      await this.copyer.copyPaths({
        sourcePath: templatePath,
        targetPath: context.targetPath!,
        ignorePath: templatePath
      });
    } finally {
      await cleanup();
    }
  }
}
