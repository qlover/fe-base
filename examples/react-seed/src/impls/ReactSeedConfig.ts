import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';

const DEFAULT_SCOPE = 'openid profile email';
const DEFAULT_REDIRECT_PATH = 'oauth/callback';

export class ReactSeedConfig implements SeedConfigInterface {
  /**
   * @override
   */
  public get env(): string {
    return import.meta.env.MODE ?? 'development';
  }
  public readonly name: string = import.meta.env.VITE_APP_NAME;
  public readonly version: string = import.meta.env.VITE_APP_VERSION;
  // public readonly isProduction: boolean = import.meta.env.PROD;
  public readonly isProduction: boolean = import.meta.env.MODE === 'production';
  public readonly logLevel: string = 'debug';
  public readonly userCredentialKey: string = 'koieluf341bj';

  public readonly oauthWrapperURL = import.meta.env.VITE_OAUTH_URL;
  public readonly oauthWrapperClientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
  public readonly oauthWrapperScope =
    import.meta.env.VITE_OAUTH_SCOPE || DEFAULT_SCOPE;
  public readonly oauthWrapperRedirectPath =
    import.meta.env.VITE_OAUTH_REDIRECT_PATH || DEFAULT_REDIRECT_PATH;

  /** When true, logout revokes the OAuth refresh token on the authorization server. */
  public readonly oauthRevokeOnLogout: boolean =
    import.meta.env.VITE_OAUTH_REVOKE_ON_LOGOUT === 'true';
}
