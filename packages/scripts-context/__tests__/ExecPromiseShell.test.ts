import { LoggerInterface } from '@qlover/logger';
import { execPromise } from '../src/implement/execPromise';
import { Shell } from '../src/implement/Shell';

describe('execPromise', () => {
  let shell: Shell;
  let logger: LoggerInterface;

  beforeEach(() => {
    logger = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      trace: vi.fn(),
      fatal: vi.fn(),
      addAppender() {}
    };
    shell = new Shell({
      logger: logger,
      execPromise: execPromise
    });
  });

  it('should resolve with command output', async () => {
    const result = await shell.exec('echo Hello World');
    expect(result).toBe('Hello World');
  });

  it('should reject with error message if command fails', async () => {
    await expect(shell.exec('invalid-command', {})).rejects.toThrow();
  });

  it('should handle non-existent command gracefully', async () => {
    try {
      await shell.exec('kjlkj --version');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
