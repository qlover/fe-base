import {
  BaseServiceInterface,
  ServiceGatewayType
} from '../interface/base/BaseServiceInterface';
import { ExecutorServiceInterface } from '../interface/base/ExecutorServiceInterface';
import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { UserStoreInterface } from '../interface/UserStoreInterface';

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Type guard to check if an object implements BaseServiceInterface
 *
 * Checks for the presence of key methods and properties required by BaseServiceInterface:
 * - serviceName (readonly property)
 * - getStore() method
 * - getGateway() method
 * - getLogger() method
 *
 * @template Store - The async store type
 * @template Gateway - The gateway type
 * @param obj - The object to check
 * @returns True if obj implements BaseServiceInterface, false otherwise
 *
 * @example
 * ```typescript
 * const service = new MyService();
 * if (isBaseServiceInterface(service)) {
 *   const store = service.getStore();
 *   const gateway = service.getGateway();
 * }
 * ```
 */
export function isBaseServiceInterface<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<any>>,
  Gateway extends ServiceGatewayType
>(obj: unknown): obj is BaseServiceInterface<Store, Gateway> {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const candidate = obj as Record<string, unknown>;

  return (
    'serviceName' in candidate &&
    (typeof candidate.serviceName === 'string' ||
      typeof candidate.serviceName === 'symbol') &&
    isFunction(candidate.getStore) &&
    isFunction(candidate.getGateway) &&
    isFunction(candidate.getLogger)
  );
}

/**
 * Type guard to check if an object implements ExecutorServiceInterface
 *
 * Checks for the presence of key methods required by ExecutorServiceInterface:
 * - All methods from BaseServiceInterface (serviceName, getStore, getGateway, getLogger)
 * - use() method for plugin registration
 * - execute() method for gateway action execution
 *
 * @template Store - The async store type
 * @template Gateway - The gateway type
 * @param obj - The object to check
 * @returns True if obj implements ExecutorServiceInterface, false otherwise
 *
 * @example
 * ```typescript
 * const service = new MyExecutorService();
 * if (isExecutorServiceInterface(service)) {
 *   service.use(myPlugin);
 *   await service.execute('action', params);
 * }
 * ```
 */
export function isExecutorServiceInterface<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<any>>,
  Gateway extends ServiceGatewayType
>(obj: unknown): obj is ExecutorServiceInterface<Store, Gateway> {
  if (!isBaseServiceInterface<Store, Gateway>(obj)) {
    return false;
  }

  const candidate = obj as unknown as Record<string, unknown>;

  return isFunction(candidate.use) && isFunction(candidate.execute);
}

/**
 * Check if the value is a UserStoreInterface instance
 *
 * Determines if the provided value implements the UserStoreInterface
 * by checking for required methods: getStore and getCredential.
 *
 * @param value - The value to check
 * @returns `true` if value is a UserStoreInterface instance, `false` otherwise
 */
export function isUserStoreInterface<User, Credential>(
  value: unknown
): value is UserStoreInterface<User, Credential> {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    'getStore' in value &&
    'getCredential' in value
  );
}
