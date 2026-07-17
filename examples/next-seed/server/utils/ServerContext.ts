import { cookies } from 'next/headers';
import { injectable } from '@shared/container';
import { i18nConfig, type LocaleType } from '@config/i18n';
import type {
  ServerContextInterface,
  ServerContextResetParams,
  ServerState
} from '@server/interfaces/ServerContextInterface';
import type { NextRequest } from 'next/server';

@injectable()
export class ServerContext implements ServerContextInterface {
  protected request?: NextRequest | Request;
  // TODO:
  protected state: ServerState;

  constructor() {
    this.state = {
      started: 0,
      uid: '',
      name: ''
    };
  }

  /**
   * @override
   */
  public getState(): ServerState;
  /**
   * @override
   */
  public getState<K extends keyof ServerState>(prop: K): ServerState[K];
  /**
   * @override
   */
  public getState(
    prop?: keyof ServerState
  ): ServerState | ServerState[keyof ServerState] {
    if (prop) {
      return this.state[prop];
    }

    return this.state;
  }

  /**
   * @override
   */
  public reset(params?: Partial<ServerContextResetParams>): Promise<void> {
    this.state = {
      started: performance.now(),
      uid: '',
      name: ''
    };

    return this.changeState(params);
  }

  /**
   * @override
   */
  public changeState(
    params?: Partial<ServerContextResetParams>
  ): Promise<void> {
    if (params) {
      if (params.request) {
        this.request = params.request;
      }
      // FIXME: 类型匹配
      Object.assign(this.state, params);
    }

    return Promise.resolve();
  }

  /**
   * @override
   */
  public async getLocale(): Promise<LocaleType> {
    const cookieStorge = await cookies();
    const locale = cookieStorge.get(i18nConfig.storageKey);

    if (
      locale?.value &&
      i18nConfig.supportedLngs.includes(locale?.value as LocaleType)
    ) {
      return locale.value as LocaleType;
    }

    // TODO: 从请求中头中获取
    if (this.request) {
    }

    return i18nConfig.fallbackLng;
  }
}
