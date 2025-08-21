'use client';

import { IOC } from '@/core/IOC';
import { createContext } from 'react';

export const IOCContext = createContext<typeof IOC | null>(null);
