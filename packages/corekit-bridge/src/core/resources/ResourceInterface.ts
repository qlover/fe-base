import type { ResourceQuery } from './ResourceStore';

/**
 * Generic interface for resource operations
 *
 * Provides a standardized contract for CRUD operations and data export functionality.
 * This interface is designed to work with any resource type and implements common
 * data management patterns.
 *
 * Features:
 * - CRUD operations (Create, Remove, Update)
 * - Search functionality with pagination and sorting
 * - Data export capability
 *
 * @template T The resource data type this interface operates on
 *
 * @example Basic implementation
 * ```typescript
 * class UserResource implements ResourceInterface<User> {
 *   async create(user: User) {
 *     // Implementation
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface ResourceInterface<T> {
  /**
   * Creates a new resource instance
   *
   * @param data - The resource data to create
   * @returns Promise resolving to the created resource
   * @throws {ValidationError} When data validation fails
   * @throws {ConflictError} When resource already exists
   */
  create(data: T): Promise<unknown>;

  /**
   * Removes an existing resource
   *
   * @param data - The resource data to remove
   * @returns Promise resolving when resource is removed
   * @throws {NotFoundError} When resource doesn't exist
   */
  remove(data: T): Promise<unknown>;

  /**
   * Updates an existing resource with partial data
   *
   * @param data - Partial resource data to update
   * @returns Promise resolving to the updated resource
   * @throws {NotFoundError} When resource doesn't exist
   * @throws {ValidationError} When update data is invalid
   */
  update(data: Partial<T>): Promise<unknown>;

  /**
   * Searches for resources based on query parameters
   *
   * @param params - Search parameters including pagination and sorting
   * @returns Promise resolving to search results
   * @throws {ValidationError} When search parameters are invalid
   */
  search(params: Partial<ResourceQuery>): Promise<unknown>;

  /**
   * Exports resource data in a specific format
   *
   * @param data - Resource data to export
   * @returns Promise resolving to exported data
   * @throws {ExportError} When export operation fails
   */
  export(data: T): Promise<unknown>;
}
