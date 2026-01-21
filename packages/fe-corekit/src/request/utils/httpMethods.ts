/**
 * This is a constant object that contains the HTTP methods.
 *
 * @example
 * ```typescript
 * const method = HttpMethods.GET;
 * ```
 *
 * @since 3.0.0
 */
export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
  TRACE: 'TRACE',
  CONNECT: 'CONNECT'
} as const;

export type HttpMethodType = (typeof HttpMethods)[keyof typeof HttpMethods];
