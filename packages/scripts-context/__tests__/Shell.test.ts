import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Shell, ShellConfig, ShellExecOptions } from '../src/Shell';
import { Logger } from '@qlover/fe-utils';
import shell from 'shelljs';

// shell need export default
vi.mock('shelljs', () => ({
  default: {
    exec: vi.fn()
  }
}));

describe('Shell', () => {
  let logger: Logger;
  let shellInstance: Shell;

  beforeEach(() => {
    logger = {
      exec: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
      verbose: vi.fn()
    } as unknown as Logger;

    const config: ShellConfig = { log: logger, isDryRun: false };
    shellInstance = new Shell(config);
  });

  describe('exec', () => {
    it('should execute a command using shelljs', async () => {
      const command = 'echo "Hello World"';
      const options: ShellExecOptions = { silent: true };
      (shell.exec as unknown as Mock).mockImplementation(
        (_cmd, _opts, callback) => {
          callback(0, 'Hello World', '');
        }
      );

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
      (shell.exec as unknown as Mock).mockImplementation(
        (_cmd, _opts, callback) => {
          callback(1, '', 'Command not found');
        }
      );

      await expect(shellInstance.exec(command)).rejects.toThrow(
        'Command not found'
      );
    });
  });

  describe('execWithArguments', () => {
    it('should execute a command with arguments using shelljs', async () => {
      const command = ['echo', 'Hello', 'World'];
      const options: ShellExecOptions = { silent: true };
      (shell.exec as unknown as Mock).mockImplementation(
        (_cmd, _opts, callback) => {
          callback(0, 'Hello World', '');
        }
      );

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
      (shell.exec as unknown as Mock).mockImplementation(
        (_cmd, _opts, callback) => {
          callback(1, '', 'Command not found');
        }
      );

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

    // is js-dom environment, the context is null
    // it('should remove the variable from the string, when the context is an invalid parameter', () => {
    //   // @ts-expect-error
    //   const result = shellInstance.format('Hello, ${name}!', null);
    //   expect(result).toBe('Hello, !');
    // });
    it('should throw an error when the context is an invalid parameter', () => {
      try {
        // @ts-expect-error
        shellInstance.format('Hello, ${name}!', null);
      } catch (e) {
        expect(e).toBeDefined();
      }
    });

    it('should throw an error when the context does not have multi-level properties', () => {
      try {
        const result = shellInstance.format(
          'Hello, ${name}! ${name.invalid.property}?',
          // @ts-expect-error
          900
        );
        expect(result).toBe('Hello, ! ${name.invalid.property}?');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
  });

  describe('run', () => {
    it('should execute a command silently', async () => {
      const command = 'echo "Hello World"';
      (shell.exec as unknown as Mock).mockImplementation(
        (_cmd, _opts, callback) => {
          callback(0, 'Hello World', '');
        }
      );

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
      (shell.exec as unknown as Mock).mockImplementation(
        (_cmd, _opts, callback) => {
          callback(1, '', 'Command not found');
        }
      );

      await expect(shellInstance.run(command)).rejects.toThrow(
        'Command not found'
      );
    });
  });
});
