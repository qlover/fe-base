/**
 * Server / Node / Next.js route-handler layer.
 *
 * Rules:
 * - May import from `../common`
 * - Must NOT import from `../client`
 * - May use Node APIs, `next/server`, cookies, headers, etc.
 */

export { NEXT_KIT_COMMON } from '../common/markers';
export { NEXT_KIT_SERVER } from './markers';

export type { UserLoginContext } from './interfaces/UserLoginContext';
export type {
  BootstrapServerRoot,
  BootstrapServerContextOptions,
  BootstrapServerPlugin,
  BootstrapServerContext,
  BootstrapServerInterface
} from './interfaces/BootstrapServerInterface';
export type {
  ServerState,
  ServerContextResetParams,
  ServerContextInterface
} from './interfaces/ServerContextInterface';
export type { ServerAuthInterface } from './interfaces/ServerAuthInterface';
export {
  Operators,
  type WhereOperation,
  type Where,
  type OperatorType,
  type FilterTriple,
  type RepoSearchParams,
  type RepoSearchInterface,
  type RepoInsertParams,
  type RepoInsertGetParams,
  type RepositoryInterface
} from './interfaces/DBBridgeInterface';

export {
  BootstrapServer,
  type BootstrapServerDeps
} from './BootstrapServer';
export {
  ApiServer,
  isApiServerContext,
  type ApiServerContext,
  type ApiServerDeps
} from './ApiServer';

export { BaseRepository } from './repositorys/BaseRepository';
export {
  SupabaseRepo,
  type SupabaseRepoDeps
} from './repositorys/SupabaseRepo';
export {
  RequestLogsRepository,
  type RequestLogsRepositoryDeps,
  type HttpRequestLogParams
} from './repositorys/RequestLogsRepository';

export {
  PasswordEncrypt
} from './utils/PasswordEncrypt';
export { TokenEncryption } from './utils/TokenEncryption';
export {
  isApiCorsEnabled,
  buildApiCorsHeaders,
  apiCorsPreflightResponse,
  type ApiCorsConfig
} from './utils/apiCors';
export { createLogger, type ServerLoggerConfig } from './utils/createLogger';
export {
  NextApiHandler,
  ResultContext,
  type ResultHandlerContext,
  type ResultHandlerInterface
} from './utils/NextApiHandler';
export {
  isStableApiErrorId,
  toStableApiExecutorError
} from './utils/normalizeApiExecutorError';
export {
  extractPostgrestError,
  isPostgrestRangeNotSatisfiable,
  parsePostgrestRowCount,
  type PostgrestErrorShape
} from './utils/postgrestError';
export { getClientIpFromRequest } from './utils/getClientIpFromRequest';
