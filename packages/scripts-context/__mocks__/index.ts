/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultFeConfig as _defaultFeConfig } from '../src/feConfig';

export class FeScriptContext {
  public readonly logger: any;
  public readonly shell: any;
  public readonly feConfig: any;
  public readonly dryRun: boolean;
  public readonly verbose: boolean;
  public readonly options: any;
  constructor(context: any) {
    const { logger, shell, feConfig, dryRun, verbose, options } = context;
    this.logger = logger;
    this.shell = shell;
    this.feConfig = feConfig;
    this.dryRun = !!dryRun;
    this.verbose = !!verbose;
    this.options = options;
  }
}
export const defaultFeConfig = _defaultFeConfig;
