/**
 * Configuration options for UI notifications
 *
 * These options control the behavior and lifecycle of notifications,
 * allowing customization of timing, error handling, and cleanup actions.
 */
export interface NotificationOptions {
  /**
   * Display duration in milliseconds
   *
   * Controls how long the notification remains visible before auto-closing.
   * If not specified, the notification will use the system default duration.
   */
  duration?: number;

  /**
   * Callback function executed when notification closes
   *
   * Useful for cleanup tasks or triggering subsequent actions after
   * the user has been notified. Called regardless of whether the
   * notification was closed automatically or manually.
   *
   * @example
   * ```typescript
   * onClose: () => {
   *   // Refresh data or update UI state
   *   refreshData();
   * }
   * ```
   */
  onClose?: () => void;

  /**
   * Error object for error notifications
   *
   * When provided, the notification will be styled as an error message
   * and may include additional error details in the display.
   * Supports any error type for flexible error handling.
   *
   * @example
   * ```typescript
   * error: new Error('Failed to save data')
   * ```
   */
  error?: unknown;
}

/**
 * Interface for displaying UI notifications
 *
 * Provides a standardized way to show notifications across the application,
 * supporting various message types (success, error, info, warning) and
 * customizable display options.
 *
 * Core features:
 * - Consistent notification styling and positioning
 * - Automatic stacking of multiple notifications
 * - Support for HTML/React elements in message content
 * - Configurable display duration and animations
 * - Error message formatting and display
 *
 * @example Success notification
 * ```typescript
 * notify('Data saved successfully', { duration: 3000 });
 * ```
 *
 * @example Error notification
 * ```typescript
 * notify('Failed to save', {
 *   error: new Error('Network error'),
 *   duration: 5000,
 *   onClose: () => logError('Save failed')
 * });
 * ```
 */
export interface UINotificationInterface {
  /**
   * Display a notification message
   *
   * Shows a notification with the specified message and options.
   * The message can be a string, error object, or a complex object
   * that will be appropriately formatted for display.
   *
   * @param message - Content to display in the notification
   * @param options - Optional configuration for the notification
   *
   * @example Simple message
   * ```typescript
   * notify('Operation completed');
   * ```
   *
   * @example Complex notification
   * ```typescript
   * notify('Save failed', {
   *   error: error,
   *   duration: 5000,
   *   onClose: () => retryOperation()
   * });
   * ```
   */
  notify(message: unknown, options?: NotificationOptions): void;
}
