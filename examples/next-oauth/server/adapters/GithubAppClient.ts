import jwt from 'jsonwebtoken';
import { inject, injectable } from '@shared/container';
import { GithubIssueError } from '@server/errors/GithubIssueError';
import type { GithubFeedbackConfigType } from '@server/interfaces/GithubIssueGatewayInterface';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';

const GITHUB_API = 'https://api.github.com';
const GITHUB_API_VERSION = '2022-11-28';
const USER_AGENT = 'next-oauth-feedback';
const REQUEST_TIMEOUT_MS = 10_000;
const APP_JWT_TTL_SEC = 9 * 60;
const APP_JWT_CLOCK_SKEW_SEC = 60;
const TOKEN_REFRESH_MARGIN_MS = 2 * 60 * 1000;

type CachedTokenType = {
  readonly token: string;
};

export type GithubAppRequestType = {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  readonly body?: unknown;
  readonly accept?: string;
};

/**
 * GitHub App installation REST 客户端（installation token 进程内缓存）。
 */
@injectable()
export class GithubAppClient {
  constructor(
    @inject(MemoryKvCacheService)
    protected readonly cache: MemoryKvCacheService
  ) {}

  public async request(
    config: GithubFeedbackConfigType,
    path: string,
    init: GithubAppRequestType
  ): Promise<Response> {
    const token = await this.getInstallationToken(config);
    const headers: Record<string, string> = this.headers(`Bearer ${token}`);
    if (init.accept) {
      headers.Accept = init.accept;
    }
    if (init.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await this.send(`${GITHUB_API}${path}`, {
      method: init.method,
      headers,
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {})
    });
    if (response.status === 401 || response.status === 403) {
      await this.cache.removeItem(this.tokenCacheKey(config));
    }
    return response;
  }

  public async toError(
    stage: string,
    response: Response
  ): Promise<GithubIssueError> {
    let detail = '';
    try {
      const json = (await response.json()) as { readonly message?: unknown };
      detail = typeof json.message === 'string' ? json.message : '';
    } catch {
      detail = '';
    }
    return new GithubIssueError(
      `${stage}: HTTP ${String(response.status)}${detail ? ` ${detail}` : ''}`,
      response.status
    );
  }

  protected async getInstallationToken(
    config: GithubFeedbackConfigType
  ): Promise<string> {
    const cacheKey = this.tokenCacheKey(config);
    const cached = await this.cache.getItem<CachedTokenType>(cacheKey);
    if (cached?.token) {
      return cached.token;
    }

    const response = await this.send(
      `${GITHUB_API}/app/installations/${encodeURIComponent(config.installationId)}/access_tokens`,
      {
        method: 'POST',
        headers: this.headers(`Bearer ${this.signAppJwt(config)}`)
      }
    );
    if (!response.ok) {
      throw await this.toError('installation token', response);
    }
    const json = (await response.json()) as {
      readonly token?: unknown;
      readonly expires_at?: unknown;
    };
    if (typeof json.token !== 'string' || !json.token) {
      throw new GithubIssueError(
        'installation token: empty token',
        response.status
      );
    }
    const expiresAtMs =
      typeof json.expires_at === 'string'
        ? Date.parse(json.expires_at)
        : Number.NaN;
    const ttlMs = Number.isFinite(expiresAtMs)
      ? expiresAtMs - Date.now() - TOKEN_REFRESH_MARGIN_MS
      : 0;
    if (ttlMs > 0) {
      await this.cache.setItem<CachedTokenType>(
        cacheKey,
        { token: json.token },
        { ttlMs }
      );
    }
    return json.token;
  }

  protected signAppJwt(config: GithubFeedbackConfigType): string {
    const nowSec = Math.floor(Date.now() / 1000);
    try {
      return jwt.sign(
        {
          iat: nowSec - APP_JWT_CLOCK_SKEW_SEC,
          exp: nowSec + APP_JWT_TTL_SEC,
          iss: config.appId
        },
        this.normalizePrivateKey(config.privateKey),
        { algorithm: 'RS256' }
      );
    } catch (error) {
      throw new GithubIssueError(
        `invalid GitHub App private key: ${error instanceof Error ? error.message : String(error)}`,
        null
      );
    }
  }

  protected normalizePrivateKey(raw: string): string {
    return raw.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
  }

  protected async send(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
    } catch (error) {
      throw new GithubIssueError(
        `GitHub request failed: ${error instanceof Error ? error.message : String(error)}`,
        null
      );
    }
  }

  protected headers(authorization: string): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      Authorization: authorization,
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': GITHUB_API_VERSION
    };
  }

  protected tokenCacheKey(config: GithubFeedbackConfigType): string {
    return `fe:github:installation-token:${config.appId}:${config.installationId}`;
  }
}
