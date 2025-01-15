import { DistinctQuestion } from 'inquirer';

export type GeneratorPrompt = DistinctQuestion;

export type GeneratorOptions = {
  prompts?: GeneratorPrompt[];
  templateRootPath: string;
};

export interface GeneratorResult extends GeneratorOptions {
  name: string;
  template: string;
  subPackages?: string[];

  /**
   * @default `packages`
   */
  packagesNames?: string;

  // generated
  targetPath?: string;
}

export type TaskOptions = {
  templateFiles: TemplateFile[];
  result: GeneratorResult;
};

export type TemplateFile = {
  path: string;
  content: string;
};
