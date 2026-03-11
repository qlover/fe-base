export interface SeedConfigInterface {
  readonly env: string;
  readonly name: string;
  readonly version: string;
  readonly isProduction: boolean;

  /**
   * log level
   *
   * @example 'debug'
   * @example 'info'
   * @example 'warn'
   * @example 'error'
   */
  readonly logLevel: string;
}
