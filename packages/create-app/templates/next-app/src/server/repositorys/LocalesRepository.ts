import { inject, injectable } from 'inversify';
import pLimit from 'p-limit';
import { Datetime } from '@/base/cases/Datetime';
import type {
  BridgeOrderBy,
  DBBridgeInterface
} from '@/server/port/DBBridgeInterface';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import {
  localesSchema,
  type LocalesSchema
} from '@migrations/schema/LocalesSchema';
import { SupabaseBridge } from '../SupabaseBridge';
import type {
  LocalesRepositoryInterface,
  UpsertResult
} from '../port/LocalesRepositoryInterface';

@injectable()
export class LocalesRepository implements LocalesRepositoryInterface {
  readonly name = 'next_app_locales';

  protected safeFields = Object.keys(localesSchema.shape);

  constructor(
    @inject(SupabaseBridge) protected dbBridge: DBBridgeInterface,
    @inject(Datetime) protected datetime: Datetime
  ) {}

  async getAll(): Promise<LocalesSchema[]> {
    const result = await this.dbBridge.get({
      table: this.name,
      fields: this.safeFields
    });
    return (result.data as LocalesSchema[]) || [];
  }

  async getLocales(
    localeName: string,
    orderBy?: BridgeOrderBy
  ): Promise<LocalesSchema[]> {
    const result = await this.dbBridge.get({
      table: this.name,
      fields: this.safeFields,
      orderBy
    });

    const data = result.data as LocalesSchema[];
    return data && data.length > 0 ? data : [];
  }

  async add(params: LocalesSchema): Promise<LocalesSchema[] | null> {
    const now = this.datetime.timestampz();
    const data = {
      ...params,
      created_at: now,
      updated_at: now
    };

    const result = await this.dbBridge.add({
      table: this.name,
      fields: this.safeFields,
      data
    });

    return (result.data as LocalesSchema[]) || null;
  }

  async updateById(
    id: number,
    params: Partial<Omit<LocalesSchema, 'id' | 'created_at'>>
  ): Promise<void> {
    if (!id || typeof id !== 'number') {
      throw new Error(
        'ID is required and must be a number for updateById operation'
      );
    }

    const data = {
      ...params,
      updated_at: this.datetime.timestampz()
    };

    await this.dbBridge.update({
      table: this.name,
      fields: this.safeFields,
      data,
      where: [['id', '=', id]]
    });
  }

  async pagination<T = LocalesSchema>(params: {
    page: number;
    pageSize: number;
    orderBy?: BridgeOrderBy;
  }): Promise<PaginationInterface<T>> {
    const result = await this.dbBridge.pagination({
      table: this.name,
      fields: this.safeFields,
      page: params.page,
      pageSize: params.pageSize,
      orderBy: params.orderBy
    });

    return {
      list: (result.data || []) as T[],
      total: result.count || 0,
      page: params.page,
      pageSize: params.pageSize
    };
  }

  /**
   * batch upsert data, support chunk processing and concurrency control
   * @param data - data to upsert
   * @param options - options
   * @param options.chunkSize - chunk size, default 100
   * @param options.concurrency - concurrency, default 3
   * @returns UpsertResult - contains success/failure details with returned data
   */
  async upsert(
    data: Partial<LocalesSchema>[],
    options?: {
      chunkSize?: number;
      concurrency?: number;
    }
  ): Promise<UpsertResult> {
    const { chunkSize = 100, concurrency = 3 } = options || {};

    // Initialize result
    const result: UpsertResult = {
      totalCount: data.length,
      successCount: 0,
      failureCount: 0,
      successChunks: [],
      failureChunks: [],
      allReturnedData: []
    };

    if (data.length === 0) {
      return result;
    }

    const now = this.datetime.timestampz();

    // Add timestamps to all data
    const dataWithTimestamp = data.map((item) => ({
      ...item,
      created_at: item.created_at || now,
      updated_at: now
    }));

    // Split data into chunks
    const chunks: Partial<LocalesSchema>[][] = [];
    for (let i = 0; i < dataWithTimestamp.length; i += chunkSize) {
      chunks.push(dataWithTimestamp.slice(i, i + chunkSize));
    }

    // Use p-limit to control concurrency
    const limit = pLimit(concurrency);

    // Execute upsert for each chunk and collect results
    const tasks = chunks.map((chunk, index) =>
      limit(async () => {
        try {
          const response = await this.dbBridge.upsert({
            table: this.name,
            fields: this.safeFields,
            data: chunk
          });

          // Extract returned data from database
          const returnedData = (response.data as LocalesSchema[]) || [];
          const affectedCount = response.count || returnedData.length;

          // Success
          result.successCount += affectedCount;
          result.allReturnedData.push(...returnedData);
          result.successChunks.push({
            success: true,
            chunkIndex: index,
            inputData: chunk,
            returnedData: returnedData,
            affectedCount: affectedCount
          });
        } catch (error) {
          // Failure
          result.failureCount += chunk.length;
          result.failureChunks.push({
            success: false,
            chunkIndex: index,
            inputData: chunk,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      })
    );

    await Promise.all(tasks);

    return result;
  }
}
