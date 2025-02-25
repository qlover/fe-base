import { ShellExecOptions } from '../interface/ShellInterface';
import { ExecPromiseFunction } from '../Shell';
import { exec } from 'child_process';

export const execPromise: ExecPromiseFunction = (
  command: string | string[],
  options: ShellExecOptions
): Promise<string> => {
  const commandString = Array.isArray(command) ? command.join(' ') : command;
  return new Promise((resolve, reject) => {
    exec(
      commandString,
      {
        encoding: 'utf-8',
        ...options
      },
      (err, stdout, stderr) => {
        if (err || stderr) {
          reject(err || stderr);
        } else {
          resolve(stdout);
        }
      }
    );
  });
};
