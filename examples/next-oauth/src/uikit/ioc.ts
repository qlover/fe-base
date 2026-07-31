'use client';

import { createIOCReact } from '@qlover/next-kit/client';
import type { IOCIdentifierMap } from '@config/ioc-identifiter';

export const { IOCContext, useIOC, IOCProvider } =
  createIOCReact<IOCIdentifierMap>();
