/**
 * @module GatewayService
 * @description Gateway service module for managing API operations with state management
 *
 * This module provides a unified service infrastructure for handling API gateway operations
 * with built-in state management, logging, and error handling capabilities. It includes
 * services for user authentication, user information management, and credential storage.
 *
 * ### Exported Members
 *
 * **Services:**
 * - `UserService`: Unified service for user authentication and management
 * - `GatewayService`: Base service class for gateway operations
 *
 * **Stores:**
 * - `UserStore`: Store for managing user authentication state (credential and user info)
 *
 * **Interfaces:**
 * - `GatewayServiceInterface`: Base interface for gateway services
 * - `UserServiceInterface`: Interface for user service operations
 * - `UserStoreInterface`: Interface for user store operations
 *
 * **Utilities:**
 * - `createUserStore`: Factory function for creating UserStore instances
 * - Type guards for runtime type checking
 *
 * ### Basic Usage
 *
 * ```typescript
 * import { UserService } from '@qlover/fe-corekit-bridge';
 *
 * // Create user service with gateway
 * const userService = new UserService({
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   store: {
 *     storage: localStorage,
 *     storageKey: 'auth-token'
 *   }
 * });
 *
 * // Login user
 * await userService.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 *
 * // Check authentication status
 * if (userService.isAuthenticated()) {
 *   const user = userService.getUser();
 *   console.log('Current user:', user);
 * }
 * ```
 *
 * ### Advanced Configuration
 *
 * ```typescript
 * import { UserService, UserStore } from '@qlover/fe-corekit-bridge';
 *
 * // Create custom store with dual persistence
 * const userService = new UserService({
 *   gateway: new UserGateway(),
 *   store: {
 *     storage: localStorage,
 *     storageKey: 'user-info',
 *     credentialStorageKey: 'auth-token',
 *     persistUserInfo: true
 *   }
 * });
 * ```
 *
 * ### Related Documentation
 * - [Gateway Service Guide](../../../docs/gateway-service.md)
 * - [User Authentication](../../../docs/user-authentication.md)
 * - [State Management](../../../docs/state-management.md)
 */

export * from './impl/UserService';
export * from './impl/UserStore';
export * from './interface/GatewayServiceInterface';
export * from './interface/UserServiceInterface';
export * from './interface/UserStoreInterface';
export * from './utils/createUserStore';
export * from './utils/typeGuards';
