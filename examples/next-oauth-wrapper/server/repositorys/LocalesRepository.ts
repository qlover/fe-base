/* eslint-disable unused-imports/no-unused-vars */
import {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import { inject, injectable } from '@shared/container';
import { localesSchema, type LocalesSchema } from '@schemas/LocalesSchema';
import { Datetime } from '@server/utils/Datetime';
import { SupabaseRepo } from './SupabaseRepo';

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

const TABLE = 'next_app_locales';
@injectable()
export class LocalesRepository extends SupabaseRepo<LocalesSchema> {
  protected safeFields = Object.keys(localesSchema.shape);

  constructor(@inject(Datetime) protected datetime: Datetime) {
    super(TABLE);
  }

  public async getAll(): Promise<LocalesSchema[]> {
    throw new Error('LocalesRepository.getAll Method not implemented.');
  }

  public async getLocales(localeName: string): Promise<LocalesSchema[]> {
    throw new Error('LocalesRepository.getLocales Method not implemented.');
  }

  public async add(params: LocalesSchema): Promise<LocalesSchema[] | null> {
    throw new Error('LocalesRepository.add Method not implemented.');
  }

  public async updateById(
    id: number,
    params: Partial<Omit<LocalesSchema, 'id' | 'created_at'>>
  ): Promise<void> {
    throw new Error('LocalesRepository.updateById Method not implemented.');
  }

  public async pagination<T = LocalesSchema>(
    params: ResourceSearchParams
  ): Promise<ResourceSearchResult<T>> {
    throw new Error('LocalesRepository.pagination Method not implemented.');
  }

  /**
   * batch upsert data, support chunk processing and concurrency control
   * @param data - data to upsert
   * @param options - options
   * @param options.chunkSize - chunk size, default 100
   * @param options.concurrency - concurrency, default 3
   * @returns UpsertResult - contains success/failure details with returned data
   */
  public async upsert(
    data: Partial<LocalesSchema>[],
    options?: {
      chunkSize?: number;
      concurrency?: number;
    }
  ): Promise<UpsertResult> {
    throw new Error('LocalesRepository.updateById Method not implemented.');
  }
}
