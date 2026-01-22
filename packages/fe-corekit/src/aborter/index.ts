/**
 * @module Aborter
 * @description Abort management module for handling operation cancellation with timeout and signal composition
 *
 * This module provides a comprehensive abort management system for controlling asynchronous operations,
 * supporting timeout mechanisms, external signal composition, and automatic resource cleanup.
 *
 * Core functionality:
 * - Operation cancellation: Manual and automatic abort control with unique ID tracking
 * - Timeout management: Automatic operation timeout with configurable duration
 * - Signal composition: Combines multiple AbortSignals (internal + timeout + external)
 * - Resource cleanup: Automatic cleanup of timers and event listeners
 * - Error handling: Rich abort error information with type detection
 *
 * ### Exported Members
 *
 * - `Aborter`: Main abort manager class handling all abort operations
 * - `AborterInterface`: Interface defining the abort management API
 * - `AborterConfig`: Configuration type for abort operations
 * - `AborterId`: Type alias for abort operation identifiers
 * - `AbortError`: Custom error class for abort operations
 * - `isAbortError`: Utility function to detect abort-related errors
 * - `ABORT_ERROR_ID`: Constant identifier for abort errors
 *
 * ### Basic Usage
 *
 * ```typescript
 * import { Aborter } from '@qlover/fe-corekit';
 *
 * const aborter = new Aborter('MyAborter');
 *
 * // Register operation with timeout
 * const { abortId, signal } = aborter.register({
 *   abortTimeout: 5000,
 *   onAborted: (config) => console.log('Operation aborted'),
 *   onAbortedTimeout: (config) => console.log('Operation timed out')
 * });
 *
 * try {
 *   await fetch('/api/data', { signal });
 * } finally {
 *   aborter.cleanup(abortId);
 * }
 * ```
 *
 * ### Advanced Usage
 *
 * ```typescript
 * import { Aborter, isAbortError } from '@qlover/fe-corekit';
 *
 * const aborter = new Aborter('APIManager');
 *
 * // Compose with external signal
 * const parentController = new AbortController();
 * const { abortId, signal } = aborter.register({
 *   abortId: 'fetch-user-data',
 *   abortTimeout: 10000,
 *   signal: parentController.signal
 * });
 *
 * try {
 *   const response = await fetch('/api/user', { signal });
 *   const data = await response.json();
 * } catch (error) {
 *   if (isAbortError(error)) {
 *     console.log('Request was cancelled or timed out');
 *   } else {
 *     console.error('Request failed:', error);
 *   }
 * } finally {
 *   aborter.cleanup(abortId);
 * }
 *
 * // Manual abort
 * aborter.abort('fetch-user-data');
 *
 * // Abort all operations
 * aborter.abortAll();
 * ```
 *
 * ### Auto Cleanup Pattern
 *
 * ```typescript
 * import { Aborter } from '@qlover/fe-corekit';
 *
 * const aborter = new Aborter();
 *
 * // Automatic cleanup after operation completes
 * const result = await aborter.autoCleanup(
 *   async ({ signal }) => {
 *     const response = await fetch('/api/data', { signal });
 *     return response.json();
 *   },
 *   { abortTimeout: 5000 }
 * );
 * ```
 *
 * ### Environment Compatibility
 *
 * - Node.js 16+: Full support with polyfills for `AbortSignal.any()` and `AbortSignal.timeout()`
 * - Node.js 20+: Uses native `AbortSignal.any()` and `AbortSignal.timeout()` for better performance
 * - Modern browsers: Full native support
 * - Legacy browsers: Requires `any-signal` polyfill (automatically included)
 *
 * @see {@link Aborter} for the main abort manager class
 * @see {@link AborterInterface} for the interface definition
 * @see {@link AbortError} for abort error handling
 */

export * from './Aborter';
export * from './AborterInterface';
export * from './AbortError';
export * from './AborterPlugin';
export * from './utils/raceWithAbort';
