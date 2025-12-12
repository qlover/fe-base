import { vi } from 'vitest';

export class Logger {
  public isCI: boolean;
  public isDryRun: boolean;
  public isDebug: boolean;
  public isSilent: boolean;
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
  public info = vi.fn();
  public debug = vi.fn();
  public warn = vi.fn();
  public error = vi.fn();
  public log = vi.fn();
  public exec = vi.fn();
  public obtrusive = vi.fn();
  public verbose = vi.fn();
}

export * from '../src';
