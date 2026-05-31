import type { MultiQuerystringOptions } from '@/utils/getMultiQuerystring';
import type { browserGlobalsName } from '@config/seed.config';
import type { DetectorOptions } from 'i18next-browser-languagedetector';

declare global {
  interface Window {
    [browserGlobalsName]: typeof import('@/globals');
  }
}

declare module 'i18next' {
  interface InitOptions {
    detection?: DetectorOptions & MultiQuerystringOptions;
  }
}

declare module '@qlover/corekit-bridge/bootstrap' {
  interface SeedConfigInterface {
    readonly userCredentialKey: string;
    readonly oauthRevokeOnLogout?: boolean;
  }
}

interface ImportMetaEnv {
  readonly VITE_OAUTH_URL?: string;
  readonly VITE_OAUTH_CLIENT_ID?: string;
  readonly VITE_OAUTH_SCOPE?: string;
  readonly VITE_OAUTH_REDIRECT_PATH?: string;
  readonly VITE_OAUTH_REVOKE_ON_LOGOUT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
