import { ExecutorServiceInterface } from '../interface/base/ExecutorServiceInterface';
import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { ServiceGatewayType } from '../interface/base/BaseServiceInterface';
import { isExecutorServiceInterface } from './typeGuards';

/**
 * Create or reuse an executor service instance
 *
 * - Significance: Utility function to create service instances or reuse existing ones
 * - Core idea: Check if input is already a service instance, otherwise create new instance
 * - Main function: Simplify service initialization logic
 * - Main purpose: Reduce code duplication when initializing services
 *
 * Design decisions:
 * - Type guard check: Uses `isExecutorServiceInterface` to check if input is already a service
 * - Type assertion: Returns input as-is if it's already a service instance
 * - Service creation: Creates new service instance using ServiceClass if input is config options
 * - Generic types: Supports different service types with proper type inference
 *
 * @template ServiceInterface - The service interface type
 * @template Config - The configuration options type for creating a new service
 * @param input - Either an existing service instance or configuration options
 * @param ServiceClass - The service class constructor to use if input is config options
 * @returns The service instance (either reused or newly created)
 *
 * @example Basic usage
 * ```typescript
 * const loginService = createExecutorService(
 *   loginServiceConfig,
 *   LoginService
 * );
 * ```
 *
 * @example With existing service instance
 * ```typescript
 * const existingService = new LoginService(config);
 * const loginService = createExecutorService(
 *   existingService,
 *   LoginService
 * );
 * // Returns existingService without creating a new instance
 * ```
 */
export function createExecutorService<
  ServiceInterface extends ExecutorServiceInterface<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AsyncStoreInterface<AsyncStoreStateInterface<any>>,
    ServiceGatewayType
  >,
  Config
>(
  input: ServiceInterface | Config | undefined,
  ServiceClass: new (config?: Config) => ServiceInterface
): ServiceInterface {
  if (input === undefined) {
    return new ServiceClass();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isExecutorServiceInterface<any, any>(input)) {
    return input as ServiceInterface;
  }

  return new ServiceClass(input as Config);
}
