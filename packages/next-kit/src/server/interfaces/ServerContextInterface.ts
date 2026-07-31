import type { UUIDType } from '../../common/schemas/common';
import type { NextRequest } from 'next/server';

export interface ServerState {
  /**
   * Timestamp when the server context was (re)started.
   */
  started: number;

  /**
   * Unique id for this server context / request.
   */
  uid: UUIDType;

  /**
   * Logical name for the current server invocation (often the API name).
   */
  name: string;

  event_type?: string;

  /**
   * Optional HTTP status override for the response.
   */
  httpStatus?: number;

  /**
   * When set, the response should redirect to this URL.
   */
  redirectUrl?: string | URL;
}

export type ServerContextResetParams = ServerState & {
  request?: NextRequest | Request;
};

/**
 * Runtime server context (locale, request id, response overrides, etc.).
 * Locale type is `string` so apps can narrow to their own locale union.
 */
export interface ServerContextInterface {
  reset(params?: Partial<ServerContextResetParams>): Promise<void>;

  changeState(params?: Partial<ServerContextResetParams>): Promise<void>;

  getLocale(): Promise<string>;

  getState(): Readonly<ServerState>;
  getState<K extends keyof ServerState>(prop: K): ServerState[K];
}
