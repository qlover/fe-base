/**
 * Interface for managing component/service lifecycle events
 *
 * Provides hooks for initialization, updates, and cleanup operations.
 * This interface implements a complete lifecycle management system that follows
 * best practices for resource management and state handling.
 *
 * Key Features:
 * - Asynchronous lifecycle hooks
 * - Predictable execution order
 * - Resource management
 * - State synchronization
 * - Error handling capabilities
 * - Memory leak prevention
 *
 * Common Use Cases:
 * - Service initialization and cleanup
 * - Component lifecycle management
 * - Resource pooling and caching
 * - Event handling and subscriptions
 * - Database connections
 * - WebSocket management
 * - Timer and interval handling
 * - State management integration
 *
 * Implementation Considerations:
 * 1. Error Handling:
 *    - Always implement proper error handling in lifecycle methods
 *    - Consider using try-catch blocks for critical operations
 *    - Properly propagate errors when necessary
 *
 * 2. Async Operations:
 *    - Methods can return Promises for async operations
 *    - Ensure proper error handling for async code
 *    - Consider timeout handling for long-running operations
 *
 * 3. State Management:
 *    - Maintain clean state transitions
 *    - Implement proper cleanup to prevent memory leaks
 *    - Consider using state machines for complex state management
 *
 * 4. Resource Management:
 *    - Track all created resources
 *    - Implement proper cleanup procedures
 *    - Consider using WeakRef for better memory management
 *
 * @example Basic Service Implementation
 * ```typescript
 * class UserService implements LifecycleInterface {
 *   private listeners: Array<() => void> = [];
 *   private apiClient: ApiClient | null = null;
 *   private cache: Map<string, any> = new Map();
 *   private config: UserServiceConfig;
 *
 *   async created(config: UserServiceConfig) {
 *     try {
 *       // Initialize configuration
 *       this.config = config;
 *
 *       // Set up API client
 *       this.apiClient = await ApiClient.create({
 *         endpoint: config.apiEndpoint,
 *         timeout: config.timeout
 *       });
 *
 *       // Set up event listeners
 *       this.listeners.push(
 *         store.subscribe('user', this.handleUserChange),
 *         store.subscribe('auth', this.handleAuthChange)
 *       );
 *
 *       // Initialize cache
 *       await this.initializeCache();
 *
 *       return { success: true };
 *     } catch (error) {
 *       console.error('Failed to initialize UserService:', error);
 *       throw new ServiceInitializationError(error);
 *     }
 *   }
 *
 *   async updated(params: { config: Partial<UserServiceConfig> }) {
 *     try {
 *       // Update configuration
 *       this.config = { ...this.config, ...params.config };
 *
 *       // Reinitialize API client if endpoint changed
 *       if (params.config.apiEndpoint) {
 *         await this.apiClient?.disconnect();
 *         this.apiClient = await ApiClient.create({
 *           endpoint: params.config.apiEndpoint,
 *           timeout: this.config.timeout
 *         });
 *       }
 *
 *       // Clear cache if needed
 *       if (params.config.cacheStrategy !== this.config.cacheStrategy) {
 *         await this.resetCache();
 *       }
 *
 *       return { success: true };
 *     } catch (error) {
 *       console.error('Failed to update UserService:', error);
 *       throw new ServiceUpdateError(error);
 *     }
 *   }
 *
 *   async destroyed() {
 *     try {
 *       // Disconnect API client
 *       await this.apiClient?.disconnect();
 *       this.apiClient = null;
 *
 *       // Remove event listeners
 *       await Promise.all(
 *         this.listeners.map(unsubscribe => unsubscribe())
 *       );
 *       this.listeners = [];
 *
 *       // Clear cache
 *       this.cache.clear();
 *
 *       return { success: true };
 *     } catch (error) {
 *       console.error('Failed to cleanup UserService:', error);
 *       throw new ServiceDestroyError(error);
 *     }
 *   }
 *
 *   private async initializeCache() {
 *     // Implementation
 *   }
 *
 *   private async resetCache() {
 *     // Implementation
 *   }
 *
 *   private handleUserChange = (user: User) => {
 *     // Implementation
 *   };
 *
 *   private handleAuthChange = (auth: Auth) => {
 *     // Implementation
 *   };
 * }
 * ```
 *
 * @example Component Implementation
 * ```typescript
 * class DataGrid implements LifecycleInterface {
 *   private virtualScroller: VirtualScroller | null = null;
 *   private resizeObserver: ResizeObserver | null = null;
 *   private dataSubscription: Subscription | null = null;
 *
 *   async created(params: DataGridConfig) {
 *     // Initialize virtual scrolling
 *     this.virtualScroller = new VirtualScroller({
 *       container: params.container,
 *       itemHeight: params.rowHeight,
 *       overscan: params.overscanCount
 *     });
 *
 *     // Set up resize handling
 *     this.resizeObserver = new ResizeObserver(this.handleResize);
 *     this.resizeObserver.observe(params.container);
 *
 *     // Subscribe to data updates
 *     this.dataSubscription = params.dataSource.subscribe(
 *       this.handleDataUpdate
 *     );
 *   }
 *
 *   async updated(params: Partial<DataGridConfig>) {
 *     if (params.rowHeight && this.virtualScroller) {
 *       this.virtualScroller.updateItemHeight(params.rowHeight);
 *     }
 *
 *     if (params.dataSource && this.dataSubscription) {
 *       await this.dataSubscription.unsubscribe();
 *       this.dataSubscription = params.dataSource.subscribe(
 *         this.handleDataUpdate
 *       );
 *     }
 *   }
 *
 *   async destroyed() {
 *     // Cleanup virtual scrolling
 *     this.virtualScroller?.destroy();
 *     this.virtualScroller = null;
 *
 *     // Remove resize observer
 *     this.resizeObserver?.disconnect();
 *     this.resizeObserver = null;
 *
 *     // Unsubscribe from data updates
 *     await this.dataSubscription?.unsubscribe();
 *     this.dataSubscription = null;
 *   }
 *
 *   private handleResize = (entries: ResizeObserverEntry[]) => {
 *     // Implementation
 *   };
 *
 *   private handleDataUpdate = (data: unknown[]) => {
 *     // Implementation
 *   };
 * }
 * ```
 */
export interface LifecycleInterface {
  /**
   * Called when the component/service is created
   *
   * This lifecycle hook is responsible for initializing the component or service.
   * It should handle all setup operations and establish the initial state.
   *
   * Primary Responsibilities:
   * - Initialize internal state and properties
   * - Set up event listeners and subscriptions
   * - Configure and connect to external services
   * - Load initial data and configurations
   * - Initialize caching mechanisms
   * - Set up resource pooling
   * - Configure logging and monitoring
   * - Initialize dependencies
   *
   * Best Practices:
   * 1. Error Handling:
   *    - Implement comprehensive error handling
   *    - Provide meaningful error messages
   *    - Consider retry mechanisms for critical operations
   *
   * 2. Resource Management:
   *    - Track all initialized resources
   *    - Implement proper cleanup procedures
   *    - Consider resource limits and constraints
   *
   * 3. Performance:
   *    - Defer non-critical initialization
   *    - Implement caching strategies
   *    - Consider lazy loading for heavy resources
   *
   * 4. Security:
   *    - Validate initialization parameters
   *    - Implement proper authentication
   *    - Handle sensitive data securely
   *
   * @param params - Optional initialization parameters
   * @returns Optional value or promise to await before completion
   * @throws {ServiceInitializationError} When initialization fails
   */
  created(params?: unknown): unknown | Promise<unknown> | void;

  /**
   * Called when the component/service needs to update
   *
   * This lifecycle hook handles updates to the component or service configuration,
   * state, or dependencies. It should ensure smooth transitions between states
   * and maintain data consistency.
   *
   * Primary Responsibilities:
   * - Handle configuration changes
   * - Update internal state safely
   * - Re-fetch or refresh data
   * - Update or reinitialize dependencies
   * - Handle property changes
   * - Optimize performance
   * - Manage cache updates
   * - Handle connection changes
   *
   * Best Practices:
   * 1. State Management:
   *    - Implement proper state transitions
   *    - Validate state changes
   *    - Maintain data consistency
   *    - Consider using transactions
   *
   * 2. Performance:
   *    - Implement partial updates
   *    - Use efficient diff algorithms
   *    - Consider debouncing/throttling
   *    - Optimize resource usage
   *
   * 3. Error Recovery:
   *    - Implement rollback mechanisms
   *    - Handle partial failures
   *    - Maintain system stability
   *    - Log important state changes
   *
   * 4. Resource Management:
   *    - Clean up unused resources
   *    - Update resource pools
   *    - Manage connection lifecycle
   *    - Handle memory efficiently
   *
   * @param params - Optional update parameters, such as changed props or config
   * @returns Optional value or promise to await before completion
   * @throws {ServiceUpdateError} When update operation fails
   */
  updated(params?: unknown): unknown | Promise<unknown> | void;

  /**
   * Called when the component/service is being destroyed
   *
   * This lifecycle hook is responsible for cleaning up resources and ensuring
   * a graceful shutdown of the component or service. It should prevent any
   * memory leaks or resource leaks.
   *
   * Primary Responsibilities:
   * - Clean up allocated resources
   * - Unsubscribe from events and observables
   * - Cancel pending operations and timers
   * - Close network connections
   * - Clear caches and temporary data
   * - Remove event listeners
   * - Reset state to initial values
   * - Dispose of child components
   *
   * Best Practices:
   * 1. Resource Cleanup:
   *    - Close all open connections
   *    - Cancel all subscriptions
   *    - Clear all timers and intervals
   *    - Release system resources
   *
   * 2. State Cleanup:
   *    - Clear sensitive data
   *    - Reset state to initial values
   *    - Clear cached data if needed
   *    - Remove persistent references
   *
   * 3. Error Handling:
   *    - Handle cleanup failures gracefully
   *    - Log cleanup errors
   *    - Ensure partial cleanup on errors
   *    - Prevent cascading failures
   *
   * 4. Performance:
   *    - Prioritize critical cleanup tasks
   *    - Handle cleanup in proper order
   *    - Prevent blocking operations
   *    - Consider cleanup timeouts
   *
   * @param params - Optional cleanup parameters
   * @returns Optional value or promise to await before completion
   * @throws {ServiceDestroyError} When cleanup operation fails
   */
  destroyed(params?: unknown): unknown | Promise<unknown> | void;
}
