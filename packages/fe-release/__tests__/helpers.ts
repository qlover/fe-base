import { vi } from 'vitest';
import type {
  DeepPartial,
  ReleaseConfig,
  ReleaseContextOptions
} from '../src/type';
import type { Logger } from '@qlover/fe-corekit';
import type { FeScriptContextOptions, Shell } from '@qlover/scripts-context';
import { ReleaseContext } from '../src';
import merge from 'lodash/merge';
import { defaultFeConfig } from '@qlover/scripts-context';
import template from 'lodash/template';

/**
 * Create a testable ReleaseContext instance
 *
 * @description Generate a pre-configured ReleaseContext instance for testing
 * @param overrideOptions - Optional context options overrides
 * @returns Configured ReleaseContext instance
 * @example
 * ```ts
 * // Create a test instance with default configuration
 * const context = createTestReleaseContext();
 *
 * // Create a test instance with custom configuration
 * const context = createTestReleaseContext({
 *   dryRun: true,
 *   verbose: true
 * });
 * ```
 */
export function createTestReleaseContext(
  overrideOptions: DeepPartial<ReleaseContextOptions> = {}
): ReleaseContext {
  const logger = createTestLogger();
  const shell = createTestShell();

  const defaultOptions: Required<ReleaseContextOptions> = {
    // @ts-expect-error
    logger,
    shell,
    dryRun: false,
    verbose: false,
    options: {},
    feConfig: defaultFeConfig
  };

  const mergedOptions = merge({}, defaultOptions, overrideOptions);
  return new ReleaseContext(mergedOptions);
}

/**
 * Create a testable Logger instance
 *
 * @returns Mocked Logger instance
 */
export function createTestLogger(): Logger {
  return {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    exec: vi.fn(),
    obtrusive: vi.fn(),
    verbose: vi.fn()
  } as unknown as Logger;
}

/**
 * Create a testable Shell instance
 *
 * @returns Mocked Shell instance
 */
export function createTestShell(): Shell {
  return {
    exec: vi.fn(),
    format: vi.fn().mockImplementation((templateString, context) => {
      return template(templateString)(context);
    })
  } as unknown as Shell;
}

/**
 * Create a mock FeScriptContext instance
 *
 * @description Create a mock FeScriptContext instance for testing
 * @param options - Custom options
 * @returns Mocked FeScriptContext instance
 * @example
 * ```ts
 * const feContext = createMockFeScriptContext({
 *   dryRun: true,
 *   options: { someOption: 'value' }
 * });
 * ```
 */
export function createMockFeScriptContext(
  options: Partial<FeScriptContextOptions<ReleaseConfig>> = {}
) {
  const defaultOptions: Required<FeScriptContextOptions<ReleaseConfig>> = {
    // @ts-expect-error
    logger: createTestLogger(),
    shell: createTestShell(),
    feConfig: {},
    dryRun: false,
    verbose: false,
    options: {},
    shared: {
      packageJson: {
        name: 'test-package',
        version: '0.9.0'
      },
      releasePR: false
    }
  };

  const mergedOptions = merge({}, defaultOptions, options);

  return {
    logger: mergedOptions.logger,
    shell: mergedOptions.shell,
    feConfig: mergedOptions.feConfig,
    dryRun: mergedOptions.dryRun,
    verbose: mergedOptions.verbose,
    options: mergedOptions.options
  };
}
