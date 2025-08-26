'use client';

import { createContext } from 'react';
import type { IOC } from '@/core/IOC';

export const IOCContext = createContext<typeof IOC | null>(null);
