import { DistinctQuestion } from 'inquirer';

export const validRequiredString = (
  value: string,
  key: string
): string | true => {
  if (typeof value !== 'string' || value.trim() === '') {
    return `${key} is required`;
  }
  return true;
};

const prompts: DistinctQuestion[] = [
  {
    type: 'input',
    name: 'name',
    message: 'Project name',
    validate: (value) => validRequiredString(value, 'Project name')
  },
  {
    type: 'list',
    name: 'templateName',
    message: 'Template name',
    choices: ['fe-react', 'pack-app']
  }
];

export default prompts;
