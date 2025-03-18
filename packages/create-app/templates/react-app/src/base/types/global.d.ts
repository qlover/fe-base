import * as feGlobals from '@/core/globals';
import type { browserGlobalsName } from '@config/common';

declare global {
  interface Window {
    [browserGlobalsName]: Readonly<typeof feGlobals>;
  }
}
