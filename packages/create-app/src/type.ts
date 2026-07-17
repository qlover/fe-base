import { type ScriptSharedInterface } from '@qlover/scripts-context';
import { type DistinctQuestion } from 'inquirer';

export type GeneratorPrompt = DistinctQuestion;

/** Template entry from GitHub examples (name + optional package.json description). */
export interface TemplateInfo {
  name: string;
  description?: string;
}

export interface GeneratorOptions extends ScriptSharedInterface {
  prompts?: GeneratorPrompt[];
  /** Template entries from GitHub examples (fetched from API). */
  templateList: TemplateInfo[];
}

export interface GeneratorContext extends GeneratorOptions {
  /** Project name. */
  projectName: string;
  /** Chosen template name. */
  template: string;
  /** Generated project path. */
  targetPath?: string;
}
