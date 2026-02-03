import type { browserGlobalsName } from '@config/react-seed';

declare global {
  interface Window {
    [browserGlobalsName]: typeof import('@/globals');
  }
}
