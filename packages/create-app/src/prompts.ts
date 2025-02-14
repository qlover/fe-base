import { GeneratorPrompt } from './type';

export const validRequiredString = (
  value: string,
  key: string
): string | true => {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${key} is required`;
  }
  return true;
};

export function createDefaultPrompts(
  templates: string[],
  packages: string[]
): GeneratorPrompt[] {
  return [
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name',
      validate: (value) => validRequiredString(value, 'Project name')
    },
    {
      type: 'list',
      name: 'template',
      message: 'Template name',
      choices: [...templates, ...packages]
    }
  ];
}
export function createPackagePrompts(templates: string[]): GeneratorPrompt[] {
  return [
    {
      type: 'checkbox',
      name: 'subPackages',
      message: 'Sub package names',
      choices: templates
    }
  ];
}
