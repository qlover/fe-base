import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import type { BridgeOrderBy } from './DBBridgeInterface';
import type { UpsertResult } from './LocalesRepositoryInterface';
import type { PaginationInterface } from './PaginationInterface';
import type { ImportLocalesData } from '../services/ApiLocaleService';

export interface AdminLocalesControllerInterface {
  getLocales(query: {
    page: number;
    pageSize: number;
    orderBy?: BridgeOrderBy;
  }): Promise<PaginationInterface<LocalesSchema>>;

  createLocale(
    body: Omit<LocalesSchema, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean }>;

  updateLocale(body: Partial<LocalesSchema>): Promise<void>;

  importLocales(formData: ImportLocalesData): Promise<UpsertResult>;
}
