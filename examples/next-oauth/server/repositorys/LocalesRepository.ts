/* eslint-disable unused-imports/no-unused-vars */
import {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import { localesSchema, type LocalesSchema } from '@qlover/next-kit/common';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { createAdminClient, createServerClient } from '@shared/supabase/server';
import { I } from '@config/ioc-identifiter';
import type { LoggerInterface } from '@qlover/logger';

export interface UpsertChunkResult {
  success: boolean;
  chunkIndex: number;
  inputData: Partial<LocalesSchema>[];
  returnedData?: LocalesSchema[];
  affectedCount?: number;
  error?: string;
}

export interface UpsertResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  successChunks: UpsertChunkResult[];
  failureChunks: UpsertChunkResult[];
  allReturnedData: LocalesSchema[];
}

const TABLE = 'next_app_locales';

@injectable()
export class LocalesRepository extends SupabaseRepo<LocalesSchema> {
  protected safeFields = Object.keys(localesSchema.shape);

  constructor(@inject(I.Logger) logger: LoggerInterface) {
    super(TABLE, {
      logger,
      getUserClient: createServerClient,
      getAdminClient: createAdminClient
    });
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
   * 批量 upsert，支持分片与并发控制。
   * @param data - 待 upsert 数据
   * @param options.chunkSize - 分片大小，默认 100
   * @param options.concurrency - 并发数，默认 3
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
