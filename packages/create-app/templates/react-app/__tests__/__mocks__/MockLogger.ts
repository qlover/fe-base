import { LoggerInterface } from '@qlover/logger';
import { vi } from 'vitest';

export class MockLogger implements LoggerInterface {
  info = vi.fn();
  error = vi.fn();
  debug = vi.fn();
  warn = vi.fn();
  trace = vi.fn();
  log = vi.fn();
  fatal = vi.fn();
  addAppender = vi.fn();
  context = vi.fn();
}
