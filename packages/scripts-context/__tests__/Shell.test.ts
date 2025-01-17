import { Shell, ShellConfig, ShellExecOptions } from '../src/Shell';
import { Logger } from '@qlover/fe-utils';
import shell from 'shelljs';

jest.mock('shelljs', () => ({
  exec: jest.fn()
}));

describe('Shell', () => {
  let logger: Logger;
  let shellInstance: Shell;

  beforeEach(() => {
    logger = {
      exec: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      verbose: jest.fn()
    } as unknown as Logger;

    const config: ShellConfig = { log: logger, isDryRun: false };
    shellInstance = new Shell(config);
  });

  describe('exec', () => {
    it('should execute a command using shelljs', async () => {
      const command = 'echo "Hello World"';
      const options: ShellExecOptions = { silent: true };
      (shell.exec as jest.Mock).mockImplementation((_cmd, _opts, callback) => {
        callback(0, 'Hello World', '');
      });

      const result = await shellInstance.exec(command, options);

      expect(result).toBe('Hello World');
      expect(shell.exec).toHaveBeenCalledWith(
        command,
        expect.objectContaining({ async: true, silent: true }),
        expect.any(Function)
      );
    });

    it('should return dryRunResult in dry-run mode', async () => {
      const command = 'echo "Hello World"';
      const options: ShellExecOptions = {
        dryRun: true,
        dryRunResult: 'Dry Run Result'
      };

      const result = await shellInstance.exec(command, options);

      expect(result).toBe('Dry Run Result');
    });

    it('should log an error if command execution fails', async () => {
      const command = 'invalid-command';
      (shell.exec as jest.Mock).mockImplementation((_cmd, _opts, callback) => {
        callback(1, '', 'Command not found');
      });

      await expect(shellInstance.exec(command)).rejects.toThrow(
        'Command not found'
      );
    });
  });

  describe('execWithArguments', () => {
    it('should execute a command with arguments using shelljs', async () => {
      const command = ['echo', 'Hello', 'World'];
      const options: ShellExecOptions = { silent: true };
      (shell.exec as jest.Mock).mockImplementation((_cmd, _opts, callback) => {
        callback(0, 'Hello World', '');
      });

      const result = await shellInstance.execWithArguments(command, options, {
        isExternal: false
      });

      expect(result).toBe('Hello World');
      expect(shell.exec).toHaveBeenCalledWith(
        'echo Hello World',
        expect.objectContaining({ async: true, silent: true }),
        expect.any(Function)
      );
    });

    it('should handle errors when executing a command with arguments', async () => {
      const command = ['invalid-command'];
      (shell.exec as jest.Mock).mockImplementation((_cmd, _opts, callback) => {
        callback(1, '', 'Command not found');
      });

      await expect(
        shellInstance.execWithArguments(command, {}, { isExternal: false })
      ).rejects.toThrow('Command not found');
    });
  });

  describe('format', () => {
    it('should format a template string with context', () => {
      const template = 'Hello, ${name}!';
      const context = { name: 'World' };

      const result = Shell.format(template, context);

      expect(result).toBe('Hello, World!');
    });

    it('should handle missing context gracefully', () => {
      const template = 'Hello, ${name}!';

      const result = Shell.format(template, { name: '' });

      expect(result).toBe('Hello, !');
    });

    it('should throw an error if template formatting fails', () => {
      const template = 'Hello, ${name}!';

      expect(() =>
        shellInstance.format(
          template,
          null as unknown as Record<string, unknown>
        )
      ).toThrow();
    });
  });

  describe('run', () => {
    it('should execute a command silently', async () => {
      const command = 'echo "Hello World"';
      (shell.exec as jest.Mock).mockImplementation((_cmd, _opts, callback) => {
        callback(0, 'Hello World', '');
      });

      const result = await shellInstance.run(command);

      expect(result).toBe('Hello World');
      expect(shell.exec).toHaveBeenCalledWith(
        command,
        expect.objectContaining({ async: true, silent: true }),
        expect.any(Function)
      );
    });

    it('should handle errors when executing a command silently', async () => {
      const command = 'invalid-command';
      (shell.exec as jest.Mock).mockImplementation((_cmd, _opts, callback) => {
        callback(1, '', 'Command not found');
      });

      await expect(shellInstance.run(command)).rejects.toThrow(
        'Command not found'
      );
    });
  });

  // 其他方法的测试可以继续添加在这里
});
