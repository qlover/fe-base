import type {
  AsyncStoreStateInterface,
  StoreInterface
} from '@qlover/corekit-bridge';

export type SessionCapabilitiesResultType = {
  readonly platformAdmin: boolean;
  readonly permissions: string[];
};

/**
 * 客户端会话权限态：由 flat session user（`system_role` + `permissions`）派生。
 * 服务端鉴权仍走中间件 / 插件。
 */
export interface SessionCapabilitiesStateInterface
  extends AsyncStoreStateInterface<SessionCapabilitiesResultType> {
  platformAdmin: boolean;
  permissions: string[];
}

export interface SessionCapabilitiesStoreInterface {
  getCapabilitiesStore(): StoreInterface<SessionCapabilitiesStateInterface>;
}
