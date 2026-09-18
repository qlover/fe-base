import { API_PUBLIC_CONFIG } from '@config/route';
import type { FePublicConfig } from '@schemas/FeSiteSettingsSchema';

const CACHE_TTL_MS = 30_000;

const defaultPublicConfig: FePublicConfig = {
  auth: {
    phoneLoginEnabled: true,
    githubOauthEnabled: true,
    googleOauthEnabled: false
  }
};

let cachedPublicConfig: FePublicConfig | null = null;
let cachedAt = 0;
let inflightPublicConfig: Promise<FePublicConfig> | null = null;

async function loadPublicConfigFromNetwork(): Promise<FePublicConfig> {
  try {
    const response = await fetch(API_PUBLIC_CONFIG, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store'
    });
    if (!response.ok) {
      return defaultPublicConfig;
    }
    return (await response.json()) as FePublicConfig;
  } catch {
    return defaultPublicConfig;
  }
}

/**
 * Loads login-page feature flags. Concurrent callers share one in-flight request
 * (avoids duplicate fetches under React Strict Mode remount). Short TTL cache.
 */
export async function fetchPublicConfig(): Promise<FePublicConfig> {
  const now = Date.now();
  if (cachedPublicConfig && now - cachedAt < CACHE_TTL_MS) {
    return cachedPublicConfig;
  }

  if (inflightPublicConfig) {
    return inflightPublicConfig;
  }

  inflightPublicConfig = loadPublicConfigFromNetwork()
    .then((config) => {
      cachedPublicConfig = config;
      cachedAt = Date.now();
      return config;
    })
    .finally(() => {
      inflightPublicConfig = null;
    });

  return inflightPublicConfig;
}

/** Clears module cache (e.g. after site settings change). */
export function invalidatePublicConfigCache(): void {
  cachedPublicConfig = null;
  cachedAt = 0;
  inflightPublicConfig = null;
}
