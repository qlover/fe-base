import type {
  RequestAdapterConfig,
  RequestExecutorInterface
} from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { OAuthGateway } from './OAuthGateway';
import {
  DEFAULT_OAUTH_AUTHORIZE_PATH,
  defaultOAuthClientConfig,
  resolveOAuthClientConfig,
  type OAuthAuthorizationConfig,
  type OAuthClientConfig,
  type OAuthLocaleOptions,
  type OAuthUrlOptions
} from './interface/OAuthConfig';
import {
  buildOAuthAuthorizeUrl,
  buildOAuthRedirectUri,
  mergeOAuthAuthorizationConfig
} from './oauthUrlUtils';
import type { OAuthUserInfo, OAuthUserMapper } from './types';
import type { OAuthClientInterface } from './interface/OAuthClientInterface';
import type { OAuthClientStoreOptions } from './PKCESessionStore';
import { PKCESessionStore } from './PKCESessionStore';
import type { OAuthGatewayAuthorizeParams } from './interface/OAuthGatwayInterface';
import {
  computePkceS256Challenge,
  generatePkceVerifier,
  randomOAuthState
} from '../core';

type OAuthClientInfrastructureOptions<T extends OAuthUserInfo> = {
  serviceName?: string | symbol;
  gateway?: OAuthGateway<T>;
  mapUser?: OAuthUserMapper;
  requester?: RequestExecutorInterface<RequestAdapterConfig<string>>;
  logger?: LoggerInterface;
  authorizePath?: string;
};

export type OAuthClientOptions<T extends OAuthUserInfo = OAuthUserInfo> =
  OAuthClientInfrastructureOptions<T> &
    OAuthClientStoreOptions & {
      config?: Partial<OAuthClientConfig>;
    } & Partial<OAuthClientConfig>;

const OAUTH_CLIENT_CONFIG_KEYS = [
  'serverUrl',
  'clientId',
  'scope',
  'redirectPath',
  'origin',
  'routerPrefix',
  'locale',
  'localeIn',
  'localeQueryParam',
  'localeHeader'
] as const satisfies readonly (keyof OAuthClientConfig)[];

function pickClientConfig(
  options: OAuthClientOptions
): Partial<OAuthClientConfig> {
  const fromOptions = Object.fromEntries(
    OAUTH_CLIENT_CONFIG_KEYS.filter((key) => options[key] !== undefined).map(
      (key) => [key, options[key]]
    )
  ) as Partial<OAuthClientConfig>;

  return {
    ...fromOptions,
    ...options.config
  };
}

export class OAuthClient<
  T extends OAuthUserInfo = OAuthUserInfo
> implements OAuthClientInterface {
  public readonly serviceName: string | symbol;
  public readonly config: OAuthClientConfig;
  protected readonly authorizePath: string;
  protected readonly mapUser?: OAuthUserMapper;
  protected readonly requester?: RequestExecutorInterface<
    RequestAdapterConfig<string>
  >;
  protected readonly logger?: LoggerInterface;
  protected readonly pkceStore: PKCESessionStore;
  protected readonly gateway: OAuthGateway<T>;

  constructor(options: OAuthClientOptions<T>) {
    const {
      serviceName = 'OAuthClient',
      gateway,
      mapUser,
      requester,
      logger,
      authorizePath = DEFAULT_OAUTH_AUTHORIZE_PATH,
      pkceStorage,
      pkceStorageKey
    } = options;

    this.serviceName = serviceName;
    this.config = resolveOAuthClientConfig(pickClientConfig(options));
    this.pkceStore = new PKCESessionStore({ pkceStorage, pkceStorageKey });
    this.mapUser = mapUser;
    this.requester = requester;
    this.logger = logger;
    this.authorizePath = authorizePath;

    this.gateway =
      gateway ??
      new OAuthGateway<T>({
        store: this.pkceStore,
        config: this.authorizationConfig,
        mapUser:
          mapUser ??
          ((userinfo: OAuthUserInfo) => {
            return userinfo;
          }),
        requester,
        authorizePath,
        origin: this.config.origin,
        routerPrefix: this.config.routerPrefix,
        locale: this.config.locale,
        localeIn: this.config.localeIn,
        localeQueryParam: this.config.localeQueryParam,
        localeHeader: this.config.localeHeader
      });
  }

  public patchConfig(config: Partial<OAuthClientConfig>): void {
    Object.assign(this.config, config);
  }

  protected get authorizationConfig(): OAuthAuthorizationConfig | null {
    const serverUrl = this.config.serverUrl?.trim();
    const clientId = this.config.clientId?.trim();
    if (!serverUrl || !clientId) {
      return null;
    }
    return {
      serverUrl: serverUrl.replace(/\/$/, ''),
      clientId,
      scope: this.config.scope || defaultOAuthClientConfig.scope!,
      redirectPath:
        this.config.redirectPath || defaultOAuthClientConfig.redirectPath!
    };
  }

  protected get urlOptions(): OAuthUrlOptions {
    const { origin, routerPrefix } = this.config;
    return { origin, routerPrefix };
  }

  protected get localeOptions(): OAuthLocaleOptions {
    const { locale, localeIn, localeQueryParam, localeHeader } = this.config;
    return { locale, localeIn, localeQueryParam, localeHeader };
  }

  public getGateway(): OAuthGateway<T> {
    return this.gateway;
  }

  public getLogger(): LoggerInterface | undefined {
    return this.logger;
  }

  /**
   * @override
   */
  public isConfigured(): boolean {
    return this.authorizationConfig != null;
  }

  /**
   * @override
   */
  public async startOAuthLogin(
    params?: Partial<OAuthGatewayAuthorizeParams>
  ): Promise<void> {
    const config = mergeOAuthAuthorizationConfig(
      params,
      this.authorizationConfig
    );
    if (!config) {
      throw new Error('OAuth is not configured');
    }

    const verifier = generatePkceVerifier();
    const challenge = await computePkceS256Challenge(verifier);
    const state = randomOAuthState();
    const redirectPath = params?.redirectPath ?? config.redirectPath;

    this.pkceStore.savePkceSession({
      state,
      codeVerifier: verifier,
      locale: this.config.locale
    });

    const redirectUri = buildOAuthRedirectUri(redirectPath, {
      ...this.urlOptions,
      ...this.localeOptions
    });
    const url = buildOAuthAuthorizeUrl({
      config,
      authorizePath: this.authorizePath,
      redirectPath: params?.redirectPath,
      scope: params?.scope,
      state,
      codeChallenge: challenge,
      ...this.urlOptions,
      ...this.localeOptions
    });

    this.logger?.debug?.(`[${String(this.serviceName)}] startOAuthLogin`, {
      locale: this.config.locale,
      redirectUri,
      statePreview: `${state.slice(0, 8)}…`,
      pkceSaved: this.pkceStore.loadPkceSession() != null,
      authorizeUrl: url
    });

    if (params?.target === '_blank') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    window.location.assign(url);
  }

  public async completeOAuthCallback(
    params?: Parameters<OAuthGateway<T>['oAuthWrapperCallback']>[0]
  ): Promise<T> {
    const session = this.pkceStore.loadPkceSession();
    const callbackState =
      params instanceof URLSearchParams ? params.get('state') : params?.state;

    this.logger?.debug?.(
      `[${String(this.serviceName)}] completeOAuthCallback`,
      {
        hasPkceSession: session != null,
        callbackStatePreview: callbackState
          ? `${callbackState.slice(0, 8)}…`
          : null,
        sessionStatePreview: session?.state
          ? `${session.state.slice(0, 8)}…`
          : null,
        locale: this.config.locale
      }
    );

    try {
      const result = await this.gateway.oAuthWrapperCallback(params);
      this.logger?.debug?.(
        `[${String(this.serviceName)}] completeOAuthCallback succeeded`
      );
      return result;
    } catch (error) {
      this.logger?.warn?.(
        `[${String(this.serviceName)}] completeOAuthCallback failed`,
        {
          message: error instanceof Error ? error.message : String(error),
          hasPkceSessionAfterFailure: this.pkceStore.loadPkceSession() != null
        }
      );
      throw error;
    }
  }

  public parseOAuthCallbackSearchParams(
    searchParams: URLSearchParams
  ): Parameters<OAuthGateway<T>['oAuthWrapperCallback']>[0] {
    return {
      code: searchParams.get('code') ?? undefined,
      state: searchParams.get('state') ?? undefined,
      error: searchParams.get('error') ?? undefined,
      error_description: searchParams.get('error_description') ?? undefined
    };
  }

  /**
   * @override
   */
  public async revokeToken(refreshToken?: string | null): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    await this.gateway.revokeToken({
      refreshToken: refreshToken ?? undefined
    });
  }

  /**
   * Fetch user profile from the OAuth userinfo endpoint and map it via {@link mapUser}.
   */
  public async fetchUserInfo(
    accessToken: string,
    refreshToken?: string
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('OAuth is not configured');
    }

    const userinfo = await this.gateway.getUserInfo(accessToken);
    const mapper = this.mapUser ?? ((info: OAuthUserInfo) => info);

    return (await mapper(userinfo, accessToken, refreshToken)) as T;
  }
}
