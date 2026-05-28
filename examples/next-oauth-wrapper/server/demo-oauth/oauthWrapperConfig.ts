import { injectable } from '@shared/container';

const DEFAULT_OAUTH_WRAPPER_API_BASE =
  'https://api.dev.brain.ai/v1.0/invoke/brain-user-system/method/api';

/**
 * Server-only config for the demo OAuth wrapper upstream user API.
 * Env: `OAUTH_WRAPPER_API_BASE`, `OAUTH_WRAPPER_API_TIMEOUT`.
 */
@injectable()
export class OAuthWrapperConfig {
  public readonly oauthWrapperApiBase: string =
    process.env.OAUTH_WRAPPER_API_BASE?.trim() || DEFAULT_OAUTH_WRAPPER_API_BASE;

  public readonly oauthWrapperApiTimeout: number = Number(
    process.env.OAUTH_WRAPPER_API_TIMEOUT ?? 10000
  );
}
