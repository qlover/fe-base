import { join } from 'path';
import { existsSync } from 'fs';
import { type GeneratorPrompt } from './type';

export const validRequiredString = (
  value: string,
  key: string
): string | true => {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${key} is required`;
  }
  return true;
};

export function createDefaultPrompts(templates: string[]): GeneratorPrompt[] {
  return [
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name',
      validate: (value) => {
        const required = validRequiredString(value, 'Project name');
        if (required !== true) return required;
        const targetPath = join(process.cwd(), (value as string).trim());
        if (existsSync(targetPath)) {
          return `The directory already exists: ${targetPath}. Please choose another name or remove it.`;
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'template',
      message: 'Template name',
      choices: templates
    }
  ];
}
