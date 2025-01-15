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

const packages = ['pack-app'];
const templates = ['node-lib', 'react-app', 'react-vite-lib'];

export const defaultPrompts: GeneratorPrompt[] = [
  {
    type: 'input',
    name: 'name',
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

export const packagePrompts: GeneratorPrompt[] = [
  {
    type: 'checkbox',
    name: 'subPackages',
    message: 'Sub package names',
    choices: templates
  }
];
