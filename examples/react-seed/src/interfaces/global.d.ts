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
  }
}
