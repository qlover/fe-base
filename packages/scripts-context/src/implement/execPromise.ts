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
        let code;
        if (!err) {
          code = 0;
        } else if (err.code === undefined) {
          code = 1;
        } else {
          code = err.code;
        }

        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(stderr || stdout));
        }
      }
    );
  });
};
