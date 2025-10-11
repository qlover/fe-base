import { inject, injectable } from 'inversify';
import type { DBBridgeInterface } from '@/server/port/DBBridgeInterface';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import {
  localesSchema,
  type LocalesSchema
} from '@migrations/schema/LocalesSchema';
import { I } from '@config/IOCIdentifier';
import type { LocalesRepositoryInterface } from '../port/LocalesRepositoryInterface';

@injectable()
export class LocalesRepository implements LocalesRepositoryInterface {
  readonly name = 'next_app_locales';

  protected safeFields = Object.keys(localesSchema.shape);

  constructor(
    @inject(I.DBBridgeInterface) protected dbBridge: DBBridgeInterface
  ) {}

  async getAll(): Promise<LocalesSchema[]> {
    const result = await this.dbBridge.get({
      table: this.name,
      fields: this.safeFields
    });
    return (result.data as LocalesSchema[]) || [];
  }

  async getLocales(): Promise<LocalesSchema[]> {
    const result = await this.dbBridge.get({
      table: this.name,
      fields: this.safeFields
    });

    const data = result.data as LocalesSchema[];
    return data && data.length > 0 ? data : [];
  }

  async add(params: LocalesSchema): Promise<LocalesSchema[] | null> {
    const now = Date.now();
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
    const data = {
      ...params,
      updated_at: Date.now()
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
  }): Promise<PaginationInterface<T>> {
    const result = await this.dbBridge.pagination({
      table: this.name,
      fields: this.safeFields,
      page: params.page,
      pageSize: params.pageSize
    });

    return {
      list: (result.data || []) as T[],
      total: result.count || 0,
      page: params.page,
      pageSize: params.pageSize
    };
  }
}
