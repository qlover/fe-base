'use client';

import { createContext } from 'react';
import type { PageI18nInterface } from '../../common/interfaces/PageI18nInterface';

export const PageI18nContext = createContext<PageI18nInterface | null>(null);
