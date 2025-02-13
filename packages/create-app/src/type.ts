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
};

export interface GeneratorRuntimes extends GeneratorOptions {
  /**
   * project name
   */
  name: string;

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
}

export type TaskOptions = {
  templateFiles: TemplateFile[];
  result: GeneratorRuntimes;
};

export type TemplateFile = {
  path: string;
  content: string;
};
