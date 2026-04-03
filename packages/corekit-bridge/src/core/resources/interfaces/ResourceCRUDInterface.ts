/** Scalar handle for the first overload of {@link detail}, {@link update}, and {@link remove} (extend at app level if needed). */
export type RefType = string | number;

/**
 * Port for resource CRUD only: detail, create, update, remove. Browse/search (paged list, infinite scroll,
 * refresh flows) should live on a separate search/query interface.
 *
 * @typeParam T - Full resource shape returned by the API
 * @typeParam Snapshot - Caller-defined shape for snapshot-style overloads and for {@link create} / {@link update}
 *   bodies where it differs from {@link T} (e.g. list row, composite locator, create DTO). Defaults to {@link T}.
 *
 * @remarks
 * **Strengths**
 * - Separates mutation + detail from search UX, so implementations are not forced to support query pagination.
 * - Two addressing styles: scalar {@link RefType} for common APIs, and {@link Snapshot} for rows, composite keys, or cached hints.
 * - {@link create} accepts `Snapshot | T` so normal DTOs and occasional full-entity bodies (clone, import) are both expressible without a third generic.
 * - {@link remove} supports batch deletes via arrays, mirroring many backend bulk-delete endpoints.
 * - Only two type parameters; {@link Snapshot} stays caller-controlled.
 *
 * **Limitations / caveats**
 * - Overload resolution: if {@link Snapshot} is structurally similar to {@link RefType} or to `RefType[]` (e.g. `Snapshot` is `string`), calls like `update(x)` or `remove([x])` may resolve to an unintended overload—prefer distinct `Snapshot` shapes or explicit typing at the call site.
 * - Single-argument `update(snapshot)` can overlap with `detail(snapshot)` in shape only; semantics (read vs write) are not enforced by types—callers and implementers must stay consistent.
 * - `Snapshot` does not encode whether an update body is a patch vs full replacement; that remains a contract between client and API.
 * - Batch `remove` returns `Promise<void>` only: per-id failures, partial success, and empty-array behavior are implementation-defined and not modeled here.
 * - {@link RefType} is only `string | number` in this module; other scalar keys must use the {@link Snapshot} overloads or a widened alias if you fork the type.
 * - Implementations must satisfy every overload signature (often one runtime method branching on argument shape).
 */
export interface ResourceCRUDInterface<T, Snapshot = T> {
  /**
   * Load full resource by a scalar handle (string id, slug, numeric id — caller convention).
   *
   * @param ref - {@link RefType} reference to the resource
   */
  detail(ref: RefType): Promise<T>;

  /**
   * Load full resource using a snapshot (cache, list row, or other hint).
   * Implementations may skip a network call when the snapshot is already sufficient.
   *
   * @param snapshot - {@link Snapshot} as defined for this resource
   */
  detail(snapshot: Snapshot): Promise<T>;

  /**
   * Create a new resource; resolves to the persisted representation (including server-generated fields).
   * Prefer {@link Snapshot} for the typical create DTO; pass full {@link T} when the body matches the resource shape (clone, import, optimistic entity, etc.).
   *
   * @param payload - {@link Snapshot} or {@link T} per caller convention
   */
  create(payload: Snapshot | T): Promise<T>;

  /**
   * Update a resource: scalar locator plus a {@link Snapshot}-shaped body (patch / DTO — caller convention).
   *
   * @param ref - {@link RefType} reference to the resource
   * @param payload - {@link Snapshot} update body
   */
  update(ref: RefType, payload: Snapshot): Promise<T>;

  /**
   * Update a resource using only a {@link Snapshot} (identity + fields in one object — caller convention).
   *
   * @param snapshot - {@link Snapshot} for the update
   */
  update(snapshot: Snapshot): Promise<T>;

  /**
   * Delete a resource, addressed by scalar handle.
   *
   * @param ref - {@link RefType} reference to the resource
   */
  remove(ref: RefType): Promise<void>;

  /**
   * Delete a resource, addressed by snapshot / locator shape.
   *
   * @param snapshot - {@link Snapshot} identifying the target resource
   */
  remove(snapshot: Snapshot): Promise<void>;

  /**
   * Delete multiple resources by scalar handles (batch — caller / backend convention).
   *
   * @param refs - One or more {@link RefType} values; empty array is implementation-defined (no-op or error)
   */
  remove(refs: readonly RefType[]): Promise<void>;

  /**
   * Delete multiple resources by {@link Snapshot} values (batch).
   *
   * @param snapshots - One or more snapshots identifying targets; empty array is implementation-defined
   */
  remove(snapshots: readonly Snapshot[]): Promise<void>;
}
