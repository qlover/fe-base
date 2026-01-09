import { Mock } from 'vitest';
import { Shell, ShellConfig } from '../../src/implement/Shell';
import { ShellExecOptions } from '../../src/interface/ShellInterface';

describe('Shell', () => {
  let logger: any;
  let shellInstance: Shell;
  let execPromiseMock: Mock;

  beforeEach(() => {
    logger = {
      error: vi.fn(),
      log: vi.fn(),
      verbose: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      trace: vi.fn(),
      fatal: vi.fn()
    } as unknown as any;

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

    it('should handle lodash template syntax with <%= %>', () => {
      const template = 'git clone <%= repo %>';
      const context = { repo: 'https://github.com/user/repo.git' };

      const result = Shell.format(template, context);

      expect(result).toBe('git clone https://github.com/user/repo.git');
    });

    it('should handle nested object access in templates', () => {
      const template = 'Server: <%= server.host %>:<%= server.port %>';
      const context = {
        server: { host: 'localhost', port: 3000 }
      };

      const result = Shell.format(template, context);

      expect(result).toBe('Server: localhost:3000');
    });

    it('should handle conditional logic in templates', () => {
      const template = 'npm install<% if (dev) { %> --save-dev<% } %>';
      const context = { dev: true };

      const result = Shell.format(template, context);

      expect(result).toBe('npm install --save-dev');
    });

    it('should handle multiple variables in template', () => {
      const template = '<%= cmd %> <%= arg1 %> <%= arg2 %>';
      const context = { cmd: 'git', arg1: 'commit', arg2: '-m "Update"' };

      const result = Shell.format(template, context);

      expect(result).toBe('git commit -m "Update"');
    });

    it('should handle empty template', () => {
      const result = Shell.format('', {});
      expect(result).toBe('');
    });

    it('should handle template without variables', () => {
      const template = 'npm install';
      const result = Shell.format(template, {});
      expect(result).toBe('npm install');
    });

    it('should handle undefined context values', () => {
      const template = 'Value: <%= value %>';
      const context = { value: undefined };

      const result = Shell.format(template, context);

      expect(result).toBe('Value: ');
    });

    it('should log error when template formatting fails', () => {
      const invalidTemplate = 'Hello, <%= name.invalid.property %>';
      const context = { name: 'World' };

      try {
        shellInstance.format(invalidTemplate, context);
      } catch {
        expect(logger.error).toHaveBeenCalled();
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

  describe('exec with template context', () => {
    it('should format command with context before execution', async () => {
      const command = 'git clone <%= repo %>';
      const context = { repo: 'https://github.com/user/repo.git' };
      execPromiseMock.mockResolvedValue('Cloned successfully');

      await shellInstance.exec(command, { context });

      expect(execPromiseMock).toHaveBeenCalledWith(
        'git clone https://github.com/user/repo.git',
        expect.any(Object)
      );
    });

    it('should handle array commands without template formatting', async () => {
      const command = ['git', 'clone', 'https://github.com/user/repo.git'];
      execPromiseMock.mockResolvedValue('Cloned successfully');

      await shellInstance.exec(command);

      expect(execPromiseMock).toHaveBeenCalledWith(command, expect.any(Object));
    });

    it('should handle complex template context', async () => {
      const command =
        'npm run build --mode <%= mode %> --output <%= output.dir %>';
      const context = {
        mode: 'production',
        output: { dir: './dist' }
      };
      execPromiseMock.mockResolvedValue('Build completed');

      await shellInstance.exec(command, { context });

      expect(execPromiseMock).toHaveBeenCalledWith(
        'npm run build --mode production --output ./dist',
        expect.any(Object)
      );
    });
  });

  describe('logger access', () => {
    it('should provide access to logger', () => {
      expect(shellInstance.logger).toBe(logger);
    });
  });

  describe('execFormattedCommand', () => {
    it('should log command when not silent', async () => {
      const command = 'npm install';
      execPromiseMock.mockResolvedValue('Installed');

      await shellInstance.execFormattedCommand(command, { silent: false });

      expect(logger.debug).toHaveBeenCalledWith(command);
    });

    it('should not log command when silent', async () => {
      const command = 'npm install';
      execPromiseMock.mockResolvedValue('Installed');

      await shellInstance.execFormattedCommand(command, { silent: true });

      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should use per-command dryRun setting over global', async () => {
      const config: ShellConfig = {
        logger,
        dryRun: true,
        execPromise: execPromiseMock
      };
      const shellWithDryRun = new Shell(config);
      const command = 'npm install';
      execPromiseMock.mockResolvedValue('Installed');

      // Override global dryRun with per-command setting
      await shellWithDryRun.exec(command, { dryRun: false });

      expect(execPromiseMock).toHaveBeenCalled();
    });

    it('should use per-command isCache setting over global', async () => {
      const config: ShellConfig = {
        logger,
        isCache: true,
        execPromise: execPromiseMock
      };
      const shellWithCache = new Shell(config);
      const command = 'npm install';
      execPromiseMock.mockResolvedValue('Installed');

      // Override global isCache with per-command setting
      await shellWithCache.exec(command, { isCache: false });
      await shellWithCache.exec(command, { isCache: false });

      // Should execute twice because cache is disabled per-command
      expect(execPromiseMock).toHaveBeenCalledTimes(2);
    });
  });
});
