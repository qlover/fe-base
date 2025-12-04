export interface KeyStorageInterface<Key, Value, Opt = unknown> {
  getKey(): Key;

  getValue(): Value | null;

  get(options?: Opt): Value | null;

  set(value: Value, options?: Opt): void;

  remove(options?: Opt): void;
}
