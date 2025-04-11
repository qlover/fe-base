import { vi } from 'vitest';
import type { ReleaseConfig, ReleaseContextOptions } from '../src/type';
import type { Logger } from '@qlover/fe-corekit';
import type {
  FeConfig,
  FeScriptContextOptions,
  ScriptContextOptions,
  Shell
} from '@qlover/scripts-context';
import { ReleaseContext } from '../src';
import merge from 'lodash/merge';

/**
 * Setup global mocks
 *
 * @description Set up the global mocks needed for testing, including Env and FeScriptContext
 * @example
 * ```ts
 * // Call this at the top of your test file
 * setupGlobalMocks();
 * ```
 */
export function setupGlobalMocks() {
  // Mock @qlover/env-loader
  vi.mock('@qlover/env-loader', () => {
    return {
      Env: class {
        static searchEnv = vi.fn().mockImplementation(() => {
          return {
            get: vi.fn(),
            set: vi.fn(),
            remove: vi.fn(),
            load: vi.fn(),
            getDestroy: vi.fn()
          };
        });
      }
    };
  });

  // Mock @qlover/scripts-context
  vi.mock('@qlover/scripts-context', () => {
    return {
      FeScriptContext: class {
        public readonly logger: Logger;
        public readonly shell: Shell;
        public readonly feConfig: FeConfig;
        public readonly dryRun: boolean;
        public readonly verbose: boolean;
        public readonly options: ScriptContextOptions<ReleaseConfig>;
        constructor(context: Required<FeScriptContextOptions<ReleaseConfig>>) {
          const { logger, shell, feConfig, dryRun, verbose, options } = context;
          // @ts-expect-error
          this.logger = logger;
          this.shell = shell;
          this.feConfig = feConfig;
          this.dryRun = !!dryRun;
          this.verbose = !!verbose;
          this.options = options;
        }
      }
    };
  });
}

/**
 * Create a mock Env instance
 *
 * @description Create a mock Env object with common methods
 * @returns Mocked Env instance
 * @example
 * ```ts
 * const mockEnv = createMockEnv();
 * ```
 */
export function createMockEnv() {
  return {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    load: vi.fn(),
    getDestroy: vi.fn()
  };
}

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
  overrideOptions: Partial<ReleaseContextOptions> = {}
): ReleaseContext {
  const logger = createTestLogger();
  const shell = createTestShell();

  const mockReleaseIt = vi.fn().mockResolvedValue({
    changelog: '## 1.0.0\n* Feature 1\n* Feature 2',
    version: '1.0.0'
  });

  const defaultOptions: Required<ReleaseContextOptions> = {
    // @ts-expect-error
    logger,
    shell,
    dryRun: false,
    verbose: false,
    options: {
      releaseIt: { releaseIt: mockReleaseIt }
    },
    shared: {
      packageJson: {
        name: 'test-package',
        version: '0.9.0'
      },
      releasePR: false
    },
    feConfig: {}
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
    exec: vi.fn()
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
    options: {
      releaseIt: { releaseIt: vi.fn() }
    },
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
