import type { DBTableInterface } from '@/server/port/DBTableInterface';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import type { BridgeOrderBy } from './DBBridgeInterface';

export interface UpsertChunkResult {
  success: boolean;
  chunkIndex: number;
  inputData: Partial<LocalesSchema>[]; // Original data sent to upsert
  returnedData?: LocalesSchema[]; // Actual data returned from database
  affectedCount?: number; // Number of rows affected
  error?: string;
}

export interface UpsertResult {
  totalCount: number; // Total items attempted
  successCount: number; // Successfully upserted items
  failureCount: number; // Failed items
  successChunks: UpsertChunkResult[];
  failureChunks: UpsertChunkResult[];
  allReturnedData: LocalesSchema[]; // All successfully upserted data combined
}

export interface LocalesRepositoryInterface extends DBTableInterface {
  getLocales(
    localeName: string,
    orderBy?: BridgeOrderBy
  ): Promise<LocalesSchema[]>;

  add(params: LocalesSchema): Promise<LocalesSchema[] | null>;

  updateById(
    id: number,
    params: Partial<Omit<LocalesSchema, 'id' | 'created_at'>>
  ): Promise<void>;

  upsert(
    params: Partial<LocalesSchema>[],
    options?: {
      chunkSize?: number;
      concurrency?: number;
    }
  ): Promise<UpsertResult>;
}
