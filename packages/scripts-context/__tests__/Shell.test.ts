import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { Shell, ShellConfig } from '../src/Shell';
import { ShellExecOptions } from '../src/interface/ShellInterface';
import { Logger } from '@qlover/fe-utils';

describe('Shell', () => {
  let logger: Logger;
  let shellInstance: Shell;
  let execPromiseMock: Mock;

  beforeEach(() => {
    logger = {
      exec: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
      verbose: vi.fn()
    } as unknown as Logger;

    execPromiseMock = vi.fn();

    const config: ShellConfig = {
      logger,
      isDryRun: false,
      execPromise: execPromiseMock
    };
    shellInstance = new Shell(config);
  });

  describe('exec', () => {
    it('should execute a command using execPromise', async () => {
      const command = 'echo "Hello World"';
      const options: ShellExecOptions = { silent: true };
      execPromiseMock.mockResolvedValue('Hello World');

      const result = await shellInstance.exec(command, options);

      expect(result).toBe('Hello World');
      expect(execPromiseMock).toHaveBeenCalledWith(
        command,
        expect.objectContaining({ silent: true })
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
      execPromiseMock.mockRejectedValue(new Error('Command not found'));

      await expect(shellInstance.exec(command)).rejects.toThrow(
        'Command not found'
      );
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
      execPromiseMock.mockResolvedValue('Hello World');

      const result = await shellInstance.run(command);

      expect(result).toBe('Hello World');
      expect(execPromiseMock).toHaveBeenCalledWith(
        command,
        expect.objectContaining({ silent: true })
      );
    });

    it('should handle errors when executing a command silently', async () => {
      const command = 'invalid-command';
      execPromiseMock.mockRejectedValue(new Error('Command not found'));

      await expect(shellInstance.run(command)).rejects.toThrow(
        'Command not found'
      );
    });
  });

  it('should throw an error if execPromise is not defined', async () => {
    const config: ShellConfig = {
      logger,
      isDryRun: false
    };
    shellInstance = new Shell(config);

    await expect(shellInstance.exec('echo "Hello"')).rejects.toThrow(
      'execPromise is not defined'
    );
  });

  it('should handle invalid command format', async () => {
    const command = null; // Invalid command
    // @ts-expect-error
    await expect(shellInstance.exec(command)).rejects.toThrow();
  });

  it('should handle non-string return from execPromise', async () => {
    execPromiseMock.mockResolvedValue(123); // Non-string return
    const result = await shellInstance.exec('echo "Hello"');
    expect(result).not.toBe('123');
  });

  it('should log error when format fails', () => {
    const template = 'Hello, ${name}!';
    const context = null; // Invalid context

    try {
      // @ts-expect-error
      shellInstance.format(template, context);
    } catch {
      expect(logger.error).toHaveBeenCalled();
    }
  });

  describe('exec with cache', () => {
    it('Should cache command execution result when cache is enabled', async () => {
      const command = 'echo "Hello World"';
      execPromiseMock.mockResolvedValue('Hello World');

      // First execution, result should be cached
      const result1 = await shellInstance.exec(command, { isCache: true });
      // Second execution, should use cached result
      const result2 = await shellInstance.exec(command, { isCache: true });

      expect(result1).toBe('Hello World');
      expect(result2).toBe('Hello World');
      // execPromiseMock should be called once, because the second time used cache
      expect(execPromiseMock).toHaveBeenCalledTimes(1);
    });

    it('Should execute command every time when cache is disabled', async () => {
      const command = 'echo "Hello World"';
      execPromiseMock.mockResolvedValue('Hello World');

      // Execute twice, disable cache
      await shellInstance.exec(command, { isCache: false });
      await shellInstance.exec(command, { isCache: false });

      // execPromiseMock should be called twice, because cache is disabled
      expect(execPromiseMock).toHaveBeenCalledTimes(2);
    });

    it('Should cache result when cache is enabled globally', async () => {
      const config: ShellConfig = {
        logger,
        isDryRun: false,
        execPromise: execPromiseMock,
        isCache: true
      };
      const shellWithCache = new Shell(config);
      const command = 'echo "Hello World"';
      execPromiseMock.mockResolvedValue('Hello World');

      // Execute twice command
      await shellWithCache.exec(command);
      await shellWithCache.exec(command);

      // execPromiseMock should be called once, because the second time used cache
      expect(execPromiseMock).toHaveBeenCalledTimes(1);
    });

    it('Should cache command execution result when command is an array', async () => {
      const command = ['echo', 'Hello World'];
      execPromiseMock.mockResolvedValue('Hello World');

      // First execution
      await shellInstance.exec(command, { isCache: true });
      // Second execution
      await shellInstance.exec(command, { isCache: true });

      expect(execPromiseMock).toHaveBeenCalledTimes(1);
      expect(execPromiseMock).toHaveBeenCalledWith(
        command,
        expect.objectContaining({ isCache: true })
      );
    });
  });
});
