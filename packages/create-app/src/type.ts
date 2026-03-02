import { type ScriptSharedInterface } from '@qlover/scripts-context';
import { type DistinctQuestion } from 'inquirer';

export type GeneratorPrompt = DistinctQuestion;

export interface GeneratorOptions extends ScriptSharedInterface {
  prompts?: GeneratorPrompt[];
  /** Template names from GitHub examples (fetched from API). */
  templateList: string[];
}

export interface GeneratorContext extends GeneratorOptions {
  /** Project name. */
  projectName: string;
  /** Chosen template name. */
  template: string;
  /** Generated project path. */
  targetPath?: string;
}
