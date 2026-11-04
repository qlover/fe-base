import { ExecutorError } from '@qlover/fe-corekit/executor';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import type { UserServiceInterface } from '@interfaces/UserServiceInterface';
import type { AppApiConfig } from './AppApiRequester';
import type {
  ExecutorContextInterface,
  LifecyclePluginInterface
} from '@qlover/fe-corekit/executor';

/**
 * 登录 / 会话恢复相关接口：不做会话闸门，避免与 restore 互相等待。
 */
const SESSION_GATE_EXEMPT_PREFIXES: readonly string[] = [
  '/api/user/login',
  '/api/user/register',
  '/api/user/session',
  '/api/user/otp/',
  '/api/user/password/forgot',
  '/api/user/password/reset',
  '/api/user/logout',
  '/api/callback/',
  '/api/public-config',
  '/api/locales/',
  '/api/reference',
  '/api/oauth/verify',
  '/api/oauth/playground-validate'
];

/**
 * 从完整或相对 URL 取出 pathname（含 query 前路径）。
 */
export function resolveApiPathname(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  const q = url.indexOf('?');
  return q >= 0 ? url.slice(0, q) : url;
}

/**
 * 业务接口是否需要先等会话恢复。
 */
export function needsSessionGate(url: string): boolean {
  const pathname = resolveApiPathname(url);
  if (!pathname.startsWith('/api/')) {
    return false;
  }
  for (const prefix of SESSION_GATE_EXEMPT_PREFIXES) {
    if (prefix.endsWith('/')) {
      if (pathname.startsWith(prefix) || pathname === prefix.slice(0, -1)) {
        return false;
      }
    } else if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return false;
    }
  }
  return true;
}

/**
 * 先身份、后业务：会话恢复进行中时，业务请求排队等待其结束；
 * 已确认未登录则本地直接拒绝，不再逐个打到服务端各自 401。
 */
export class AppApiSessionGatePlugin implements LifecyclePluginInterface<
  ExecutorContextInterface<AppApiConfig>
> {
  public readonly pluginName = 'AppApiSessionGatePlugin';

  /**
   * @param resolveUserService - 延迟解析，避免注册期提前实例化 UserService
   */
  constructor(
    protected readonly resolveUserService: () => UserServiceInterface
  ) {}

  /**
   * @override
   */
  public async onBefore(
    context: ExecutorContextInterface<AppApiConfig>
  ): Promise<void> {
    const url = context.parameters.url;
    if (typeof url !== 'string' || !needsSessionGate(url)) {
      return;
    }

    const ready = await this.resolveUserService().awaitSessionReady();
    if (!ready) {
      throw new ExecutorError(API_NOT_AUTHORIZED, 'Session not authenticated');
    }
  }
}
