import { vi } from 'vitest';
import type {
  DeepPartial,
  ReleaseConfig,
  ReleaseContextOptions
} from '../src/type';
import type { LoggerInterface } from '@qlover/logger';
import type { ScriptContextInterface, Shell } from '@qlover/scripts-context';
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
export function createTestReleaseOptions(
  overrideOptions: DeepPartial<ReleaseContextOptions> = {}
): ReleaseContextOptions {
  const logger = createTestLogger();
  const shell = createTestShell();

  const defaultOptions: Required<ReleaseContextOptions> = {
    logger,
    shell,
    dryRun: false,
    verbose: false,
    options: {},
    feConfig: defaultFeConfig
  };

  return merge({}, defaultOptions, overrideOptions) as ReleaseContextOptions;
}

/**
 * Create a testable Logger instance
 *
 * @returns Mocked Logger instance
 */
export function createTestLogger(): LoggerInterface {
  return {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    exec: vi.fn(),
    obtrusive: vi.fn(),
    verbose: vi.fn()
  } as unknown as LoggerInterface;
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
  options: Partial<ScriptContextInterface<ReleaseConfig>> = {}
) {
  const defaultOptions: Required<ScriptContextInterface<ReleaseConfig>> = {
    logger: createTestLogger(),
    shell: createTestShell(),
    feConfig: {},
    dryRun: false,
    verbose: false,
    options: {}
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
