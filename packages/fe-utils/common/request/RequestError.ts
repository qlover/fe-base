import { ExecutorError } from '../executor';

export class RequestError extends ExecutorError {}

/**
 * Error IDs for different fetch request failure scenarios
 * Used to identify specific error types in error handling
 */
export enum RequestErrorID {
  /** Generic fetch request error */
  REQUEST_ERROR = 'REQUEST_ERROR',
  /** Environment doesn't support fetch API */
  ENV_FETCH_NOT_SUPPORT = 'ENV_FETCH_NOT_SUPPORT',
  /** No fetcher function provided */
  FETCHER_NONE = 'FETCHER_NONE',
  /** Response status is not OK (not in 200-299 range) */
  RESPONSE_NOT_OK = 'RESPONSE_NOT_OK',
  /** Request was aborted */
  ABORT_ERROR = 'ABORT_ERROR',
  /** URL is not provided */
  URL_NONE = 'URL_NONE'
}
