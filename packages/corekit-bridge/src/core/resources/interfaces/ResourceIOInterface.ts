import type { ResourceSearchParams } from './ResourceSearchInterface';

/**
 * Typical binary/multipart import source (`File` in browsers is a {@link Blob}). For structured rows, pick another
 * `TPayload` on {@link ResourceIOInterface}.
 *
 * @since `3.1.0`
 */
export type ResourceImportBody = Blob | FormData | ArrayBuffer;

/**
 * Normalized import response. Only `status` is required; meaning is entirely API-defined (string token or numeric code).
 *
 * @since `3.1.0`
 */
export interface ResourceInResult {
  status: string | number;
  /** Rows successfully written in this round-trip, when the API reports it. */
  count?: number;
  /** Stable id for the batch, entity, or async job (same slot as a “jobId” if you only have one). */
  id?: string;
  /** Link to poll status, download an error report, or open a portal page. */
  url?: string;
  /** Free-form note: human message, vendor error string, or auxiliary code text. */
  hint?: string;
}

/**
 * Normalized export response. Only `status` is required; payload is either inline `body` or remote `url`, or an async
 * `id`/`url` pair—per your backend.
 *
 * @since `3.1.0`
 */
export interface ResourceOutResult {
  status: string | number;
  /** Inline bytes or string payload when the file is returned in-band. */
  body?: Blob | ArrayBuffer | string;
  /** Signed download URL or landing page when the file is out-of-band. */
  url?: string;
  /** Export job or document id when useful for follow-up calls. */
  id?: string;
  /** Suggested name for a save dialog when `body` or `url` points to a file. */
  filename?: string;
}

/**
 * Port for **bulk ingest** (`importData`) and **bulk export** (`exportData`) on one resource type.
 *
 * @typeParam TPayload - Import input; **required**—rows, parse output, {@link ResourceImportBody}, etc.
 * @typeParam TCriteria - Export scope; extends {@link ResourceSearchParams} so it can align with list/search filters.
 *
 * @remarks
 * **Contract**
 * - Use `importData` / `exportData` method names because `import` and `export` are reserved in JavaScript.
 * - Hard failures (4xx/5xx, invalid file) should **reject** the `Promise`; {@link ResourceInResult} /
 *   {@link ResourceOutResult} describe **successful** HTTP responses with a body.
 * - `status` values are **not** enumerated here—define constants or enums in your app (e.g. `'ok'`, `'pending'`, `200`).
 * - MIME type, headers, and extra vendor fields can live outside these types (e.g. wrapper around `fetch`) or in
 *   `hint` when a single string is enough.
 * - Import-only or export-only backends can still implement this interface and reject the unsupported operation, or
 *   expose a thin facade that only forwards one method.
 *
 * @since `3.1.0`
 *
 * @example CSV import and filtered export
 * ```typescript
 * class ProductIO implements ResourceIOInterface<FormData, ProductSearchParams> {
 *   async importData(source: FormData) {
 *     const res = await fetch('/api/products/import', { method: 'POST', body: source });
 *     return (await res.json()) as ResourceInResult;
 *   }
 *   async exportData(scope: ProductSearchParams) {
 *     const res = await fetch('/api/products/export?' + new URLSearchParams(String(scope)));
 *     return { status: 'ok', body: await res.blob() };
 *   }
 * }
 * ```
 */
export interface ResourceIOInterface<
  TPayload,
  TCriteria extends ResourceSearchParams = ResourceSearchParams
> {
  /**
   * Submit data to import; resolves to a {@link ResourceInResult} on success.
   *
   * @since `3.1.0`
   */
  importData(source: TPayload): Promise<ResourceInResult>;

  /**
   * Request an export for the given scope; resolves to a {@link ResourceOutResult} on success.
   *
   * @since `3.1.0`
   */
  exportData(scope: TCriteria): Promise<ResourceOutResult>;
}
