import { describe, it, expect, beforeEach } from 'vitest';
import { execPromise } from '../src/implement/execPromise';
import { Shell } from '../src/Shell';
import { Logger } from '@qlover/fe-utils';

describe('execPromise', () => {
  let shell: Shell;

  beforeEach(() => {
    shell = new Shell({
      logger: new Logger(),
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
