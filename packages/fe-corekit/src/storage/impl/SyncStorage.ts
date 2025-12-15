import type { SerializerIneterface } from '../../serializer';
import type { Encryptor } from '../../encrypt';
import type { SyncStorageInterface } from '../interface/SyncStorageInterface';
import type {
  PipeType,
  PipeValue
} from '../interface/SyncStoragePipeInterface';

function toPipeValue<Key>(
  pipe: PipeType<Key> | PipeValue<Key>
): PipeValue<Key> | null {
  if ('type' in pipe && 'pipe' in pipe) {
    return pipe;
  }

  if ('serialize' in pipe && 'deserialize' in pipe) {
    return { pipe, type: 'serialize' };
  }

  if ('encrypt' in pipe && 'decrypt' in pipe) {
    return { pipe, type: 'encrypt' };
  }

  if (
    'setItem' in pipe &&
    'getItem' in pipe &&
    'removeItem' in pipe &&
    'clear' in pipe
  ) {
    return { pipe, type: 'storage' };
  }

  return null;
}

const operationMaps = {
  setItem: {
    serialize: (
      pipe: SerializerIneterface<unknown, unknown>,
      args: unknown[]
    ) => pipe.serialize(...(args as [unknown])),
    encrypt: (pipe: Encryptor<unknown, unknown>, args: unknown[]) =>
      pipe.encrypt(...(args as [unknown])),
    storage: (pipe: SyncStorageInterface<unknown>, args: unknown[]) =>
      pipe.setItem(...(args as [unknown, unknown]))
  },
  getItem: {
    serialize: (
      pipe: SerializerIneterface<unknown, unknown>,
      args: unknown[]
    ) => pipe.deserialize(...(args as [unknown])),
    encrypt: (pipe: Encryptor<unknown, unknown>, args: unknown[]) =>
      pipe.decrypt(...(args as [unknown])),
    storage: (pipe: SyncStorageInterface<unknown>, args: unknown[]) =>
      pipe.getItem(...(args as [unknown]))
  }
};

export type PipeArg<Key> = PipeType<Key> | PipeValue<Key>;

export class SyncStorage<Key, Opt = unknown>
  implements SyncStorageInterface<Key, Opt>
{
  /**
   * Internal pipe value list, pre-determined type
   */
  protected readonly pipes: PipeValue<Key>[];

  constructor(
    protected readonly storage: SyncStorageInterface<Key, Opt>,
    pipes: PipeArg<Key>[] | PipeArg<Key> = []
  ) {
    this.pipes = (Array.isArray(pipes) ? pipes : [pipes])
      .map((p) => toPipeValue(p))
      .filter((p): p is PipeValue<Key> => p != null);
  }

  /**
   * Get the number of storage items

   * @override
      */
  public get length(): number {
    return this.storage.length;
  }

  /**
   * @override
   */
  public setItem<T>(key: Key, value: T, options?: Opt): void {
    let processedValue: unknown = value;

    // Process value through all pipes before storing
    for (const currentPipe of this.pipes) {
      const { type, pipe } = currentPipe;

      if (type === 'storage') {
        // Store in intermediate storage
        (pipe as SyncStorageInterface<Key, unknown>).setItem(
          key,
          processedValue,
          options
        );
      } else {
        // Apply transformation (serialize, encrypt, etc.)
        const result = operationMaps.setItem[type](
          // @ts-expect-error
          pipe,
          [processedValue]
        );

        if (result != null) {
          processedValue = result;
        }
      }
    }

    // Finally store the processed value in the main storage
    this.storage.setItem(key, processedValue, options);
  }

  /**
   * @override
   */
  public getItem<T>(key: Key, defaultValue?: T, options?: Opt): T | null {
    let processedValue = this.storage.getItem(key, defaultValue, options);

    // If no value found in main storage, try intermediate storage
    if (processedValue == null) {
      // important: reverse the pipes
      // because the storage pipe is the last one, so we need to reverse the pipes
      // to get the value from the storage pipe
      const reversedPipes = [...this.pipes].reverse();

      // try get value from pipe
      for (const currentPipe of reversedPipes) {
        const { type, pipe } = currentPipe;

        if (type !== 'storage') {
          continue;
        }

        const res = operationMaps.getItem[type](pipe, [
          key,
          processedValue,
          options
        ]);

        // found value!
        if (res != null) {
          processedValue = res as T;
          break;
        }
      }
    }

    if (processedValue == null) {
      return defaultValue ?? null;
    }

    // Process the value through the decryption/deserialization pipeline
    const reversedPipes = [...this.pipes].reverse();

    for (const currentPipe of reversedPipes) {
      const { type, pipe } = currentPipe;

      if (type === 'storage') {
        continue;
      }

      processedValue = operationMaps.getItem[type](
        pipe as SerializerIneterface<unknown, unknown> &
          Encryptor<unknown, unknown>,
        [processedValue]
      ) as T;
    }

    // try get raw value from storage
    if (processedValue !== null && this.storage.getRawValue) {
      processedValue = this.storage.getRawValue(processedValue, options) as T;
    }

    return (processedValue ?? null) as T;
  }

  /**
   * Delete data items, delete from all storage layers
   *
   * @override
   * @param key - Storage key
   * @param options - Delete options
   */
  public removeItem(key: Key, options?: Opt): void {
    this.storage.removeItem(key, options);

    this.pipes
      .filter((p) => p.type === 'storage')
      .forEach((p) => {
        (p.pipe as SyncStorageInterface<Key, unknown>).removeItem(key, options);
      });
  }

  /**
   * Clear all data, including storage in the pipeline

   * @override
      */
  public clear(): void {
    this.storage.clear();

    this.pipes
      .filter((p) => p.type === 'storage')
      .forEach((p) => {
        (p.pipe as SyncStorageInterface<Key, unknown>).clear();
      });
  }
}
