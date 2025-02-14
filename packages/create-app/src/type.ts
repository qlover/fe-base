import { DistinctQuestion } from 'inquirer';

export type GeneratorPrompt = DistinctQuestion;

export type GeneratorOptions = {
  prompts?: GeneratorPrompt[];
  /**
   * template root path
   */
  templateRootPath: string;

  /**
   * configs root path
   */
  configsRootPath: string;

  /**
   * whether to copy config files
   */
  config?: boolean;
};

export interface GeneratorContext extends GeneratorOptions {
  /**
   * project name
   */
  projectName: string;

  /**
   * choose template name
   *
   * mayby is pack-app
   */
  template: string;

  /**
   * choose sub packages
   *
   * mayby is ['node-lib', 'react-app']
   */
  subPackages?: string[];

  /**
   * @default `packages`
   */
  packagesNames?: string;

  /**
   * Generated project path
   * @default `./`
   */
  targetPath?: string;

  /**
   * release path
   * @default `src`
   */
  releasePath?: string;
}

export type TaskOptions = {
  templateFiles: TemplateFile[];
  result: GeneratorContext;
};

export type TemplateFile = {
  path: string;
  content: string;
};
