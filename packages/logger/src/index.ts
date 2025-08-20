/**
 * @module Logger
 * @description A flexible and extensible logging system for applications
 *
 * This module provides a comprehensive logging solution with the following features:
 * - Customizable log levels and formats
 * - Multiple output handlers support
 * - Timestamp formatting
 * - Contextual logging
 * - Interface-based design for extensibility
 *
 * ### Exported Members
 *
 * - Logger: Main logging class for handling log events
 * - ConsoleHandler: Default handler for console output
 * - TimestampFormatter: Timestamp formatting utility
 * - LoggerInterface: Core logger interface definition
 * - HandlerInterface: Log handler interface
 * - FormatterInterface: Log formatter interface
 * - LogEvent: Log event type definitions
 * - LogContext: Log context type definitions
 *
 * ### Basic Usage
 * ```typescript
 * import { Logger, ConsoleHandler, TimestampFormatter } from '@qlover/logger';
 *
 * // Create logger with console handler
 * const logger = new Logger({
 *   handlers: [new ConsoleHandler()],
 *   formatter: new TimestampFormatter()
 * });
 *
 * // Log messages
 * logger.info('Application started');
 * logger.error('An error occurred', { error: new Error('Failed to connect') });
 * ```
 *
 * ### Advanced Configuration
 * ```typescript
 * import { Logger, ConsoleHandler, TimestampFormatter } from '@qlover/logger';
 *
 * const logger = new Logger({
 *   handlers: [
 *     new ConsoleHandler({
 *       level: 'debug',
 *       formatter: new TimestampFormatter('YYYY-MM-DD HH:mm:ss')
 *     })
 *   ]
 * });
 * ```
 */
export * from './Logger';
export * from './ConsoleHandler';
export * from './TimestampFormatter';
export * from './interface/LoggerInterface';
export * from './interface/HandlerInterface';
export * from './interface/FormatterInterface';
export * from './interface/LogEvent';
export * from './interface/LogContext';
