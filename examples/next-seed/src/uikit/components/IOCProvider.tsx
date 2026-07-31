'use client';

import { ClientIOCRegister } from '@/impls/ClientIOCRegister';
import { logger } from '@/impls/globals';
import { IOCProvider as KitIOCProvider } from '../ioc';
import type { ReactNode } from 'react';

export function IOCProvider(props: { children: ReactNode }) {
  return (
    <KitIOCProvider register={ClientIOCRegister} logger={logger}>
      {props.children}
    </KitIOCProvider>
  );
}
