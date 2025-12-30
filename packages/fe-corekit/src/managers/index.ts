/**
 * @module AbortManager
 * @description Abort control and signal management utilities
 *
 * This module provides comprehensive abort control for asynchronous operations,
 * including signal combination, timeout management, and resource cleanup.
 *
 * ### Core Components
 *
 * - **AbortManager**: Main manager for managing abort controllers and operations
 * - **ProxyAbortManager**: Extended manager with timeout and external signal support
 * - **AbortError**: Custom error for abort operations
 *
 * ### Basic Usage
 *
 * abort manager
 * ```typescript
 * import { AbortManager } from '@qlover/fe-corekit/pools';
 *
 * const manager = new AbortManager('APIManager');
 *
 * const { abortId, signal } = manager.register({ abortId: 'fetch-users' });
 *
 * fetch('/api/users', { signal })
 *   .finally(() => manager.cleanup(abortId));
 *
 * // cancel the operation
 * manager.abort(abortId);
 * ```
 *
 * auto cleanup
 * ```typescript
 * import { AbortManager } from '@qlover/fe-corekit/pools';
 *
 * const manager = new AbortManager('APIManager');
 *
 * const { abortId, signal } = manager.register({ abortId: 'fetch-users' });
 *
 * // will cleanup the operation after the promise settles
 * manager.autoCleanup(fetch('/api/users', { signal }))
 * ```
 *
 * ### timeoutSignal
 *
 * same as AbortSignal.timeout
 *
 * ```typescript
 * import { timeoutSignal } from '@qlover/fe-corekit/pools';
 *
 * const signal = timeoutSignal(5000);
 *
 * fetch('/api/data', { signal })
 *   .finally(() => signal.clear());
 * ```
 *
 * ### anySignal
 *
 * same as AbortSignal.any
 *
 * ```typescript
 * import { anySignal } from '@qlover/fe-corekit/pools';
 *
 * const signal = anySignal([signal1, signal2]);
 *
 * fetch('/api/data', { signal })
 *   .finally(() => signal.clear());
 * ```
 *
 */

// Core classes
export * from './AbortError';
export * from './AbortManager';
export * from './ProxyAbortManager';
export * from './RetryManager';

// Interfaces and types
export * from './interface/AbortManagerInterface';
export * from './interface/RetryManagerInterface';

// Utils
export { timeoutSignal } from './utils/timeoutSignal';
export { anySignal } from './utils/anySignal';
