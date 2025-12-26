/**
 * @module AbortPool
 * @description Abort control and signal management utilities
 *
 * This module provides comprehensive abort control for asynchronous operations,
 * including signal combination, timeout management, and resource cleanup.
 *
 * ### Core Components
 *
 * - **AbortPool**: Main pool for managing abort controllers and operations
 * - **SignalCombiner**: Combines multiple abort signal sources
 * - **SignalCoordinator**: Manages cleanup functions for event listeners and timers
 * - **AbortSignalCompat**: Compatibility detection for AbortSignal APIs
 * - **AbortError**: Custom error for abort operations
 *
 * ### Basic Usage
 *
 * abort pool
 * ```typescript
 * import { AbortPool } from '@qlover/fe-corekit/pools';
 *
 * const pool = new AbortPool('APIPool');
 *
 * const { abortId, signal } = pool.register({ abortId: 'fetch-users' });
 *
 * fetch('/api/users', { signal })
 *   .finally(() => pool.cleanup(abortId));
 *
 * // cancel the operation
 * pool.abort(abortId);
 * ```
 *
 * auto cleanup
 * ```typescript
 * import { AbortPool } from '@qlover/fe-corekit/pools';
 *
 * const pool = new AbortPool('APIPool');
 *
 * const { abortId, signal } = pool.register({ abortId: 'fetch-users' });
 *
 * // will cleanup the operation after the promise settles
 * pool.autoCleanup(fetch('/api/users', { signal }))
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
export { AbortPool } from './AbortPool';
export { AbortError } from './AbortError';
export { AutoCleanupPromise } from './AutoCleanupPromise';
export { RetryPool } from './RetryPool';
export type { RetryOptions } from './RetryPool';

// Utils
export { timeoutSignal } from './utils/timeoutSignal';
export { anySignal } from './utils/anySignal';
