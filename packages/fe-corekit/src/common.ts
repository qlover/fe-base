/**
 * Get the value type of an object
 *
 * @since 1.0.14
 *
 * @example
 * ```ts
 * type T = { a: number; b: string };
 * type V = ValueOf<T>; // V is number | string
 * ```
 */
export type ValueOf<T> = T[keyof T];

/**
 * Get the intersection type of two types
 *
 * @since 1.0.14
 *
 * @example
 * ```ts
 * type T1 = { a: number; b: string };
 * type T2 = { a: number; c: boolean };
 * type I = Intersection<T1, T2>; // I is { a: number }
 * ```
 */
export type Intersection<T1, T2> = {
  [P in keyof T1 & keyof T2]: T1[P] | T2[P];
};

/**
 * Create a partial type by omitting some keys and making the rest partial
 *
 * @since 3.0.0
 *
 * @example
 * ```ts
 * type T = { a: number; b: string };
 * type P = PartialBy<T, 'b'>; // P is { a: number; b?: string }
 * ```
 */
export type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends object ? PartialDeep<T[K]> : T[K];
};