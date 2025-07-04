import { Encryptor } from '../../encrypt';
import { SerializerIneterface } from '../../serializer';
import { SyncStorageInterface } from './SyncStorageInterface';

/**
 * Pipe processor type definition
 *
 * Significance: Define the type of components that can be used for data processing pipelines
 * Core idea: Unify the type definition of different processors, supporting data transformation and intermediate storage
 * Main function: Provide type-safe pipeline components
 * Main purpose: Support serialization, encryption, intermediate storage, and other data processing operations
 */
export type PipeType<Key> =
  | SerializerIneterface<unknown, unknown>
  | Encryptor<unknown, unknown>
  | SyncStorageInterface<Key, unknown>;

/**
 * Pipe value definition, containing the pipe processor and its type identifier
 *
 * Significance: Pre-determine the pipe type to avoid runtime type checks
 * Core idea: Bind the pipe processor with its type to improve execution efficiency
 * Main function: Store the pipe processor and its type information
 * Main purpose: Optimize pipe execution performance, simplify type judgment logic
 */
export type PipeValue<Key> =
  | {
      type: 'serialize';
      pipe: SerializerIneterface<unknown, unknown>;
    }
  | {
      type: 'encrypt';
      pipe: Encryptor<unknown, unknown>;
    }
  | {
      type: 'storage';
      pipe: SyncStorageInterface<Key, unknown>;
    };

export interface SyncStoragePipeInterface<Key, ComposeOptions = unknown>
  extends SyncStorageInterface<Key, ComposeOptions> {
  readonly pipes: PipeValue<Key>[];
}
