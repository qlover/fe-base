import { vi } from 'vitest';
import type { LoggerInterface } from '@qlover/logger';

export class MockLogger implements LoggerInterface {
  public info = vi.fn();
  public error = vi.fn();
  public debug = vi.fn();
  public warn = vi.fn();
  public trace = vi.fn();
  public log = vi.fn();
  public fatal = vi.fn();
  public addAppender = vi.fn();
  public context = vi.fn();
}
