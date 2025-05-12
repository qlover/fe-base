import { vi } from 'vitest';

export class Logger {
  isCI: boolean;
  isDryRun: boolean;
  isDebug: boolean;
  isSilent: boolean;
  constructor({
    isCI = false,
    dryRun = false,
    debug = false,
    silent = false
  } = {}) {
    this.isCI = isCI;
    this.isDryRun = dryRun;
    this.isDebug = debug;
    this.isSilent = silent;
  }
  info = vi.fn();
  debug = vi.fn();
  warn = vi.fn();
  error = vi.fn();
  log = vi.fn();
  exec = vi.fn();
  obtrusive = vi.fn();
  verbose = vi.fn();
}

export { AsyncExecutor } from '../src/common/executor';
export { PromiseTask } from '../src/interface/executor';
