import type { ModalFuncProps } from 'antd';

/**
 * Confirmation dialog configuration options
 * Extends Ant Design's ModalFuncProps and requires a title
 */
export interface ConfirmOptions extends ModalFuncProps {
  content: string;
}

/**
 * Basic dialog configuration options
 */
export interface InteractionOptions {
  /** Display duration (milliseconds) */
  duration?: number;
  /** Close callback function */
  onClose?: () => void;
  /** Error object */
  error?: unknown;
}

/**
 * Interaction Hub Interface
 *
 * This interface serves as the central interaction layer for the application,
 * managing all user interface interactions, notifications, and feedback functionality.
 * Main responsibilities include:
 * 1. Providing a unified message notification mechanism (success/error/info/warn)
 * 2. Handling user interaction confirmation scenarios (confirm)
 * 3. Unified error display and handling approach
 *
 * Design Goals:
 * - Uniformity: Provide consistent user interaction experience
 * - Extensibility: Easy to add new interaction types
 * - Configurability: Support custom interaction behaviors
 * - Decoupling: Separate UI interaction layer from business logic
 *
 * Use Cases:
 * - Operation success/failure feedback
 * - Important operation confirmation prompts
 * - System message notifications
 * - Warning message display
 *
 * Implementation Notes:
 * - Currently implemented based on Ant Design component library
 * - Supports other UI libraries through different adapters
 * - Supports global configuration of default behaviors
 *
 * @example
 * // Success notification
 * interactionHub.success("Operation successful", { duration: 3000 });
 *
 * // Confirmation dialog
 * interactionHub.confirm({
 *   content: "Are you sure you want to delete?",
 *   onOk: () => handleDelete()
 * });
 */
export interface InteractionHubInterface {
  /**
   * Display success notification
   * @param message Notification message
   * @param options Configuration options
   */
  success(message: string, options?: InteractionOptions): void;

  /**
   * Display error notification
   * @param message Error message
   * @param options Configuration options
   */
  error(message: string, options?: InteractionOptions): void;

  /**
   * Display information notification
   * @param message Information message
   * @param options Configuration options
   */
  info(message: string, options?: InteractionOptions): void;

  /**
   * Display warning notification
   * @param message Warning message
   * @param options Configuration options
   */
  warn(message: string, options?: InteractionOptions): void;

  /**
   * Display confirmation dialog
   * @param options Confirmation dialog configuration options
   */
  confirm(options: ConfirmOptions): void;
}
