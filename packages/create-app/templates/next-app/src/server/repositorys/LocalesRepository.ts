import { inject, injectable } from 'inversify';
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
import { I } from '@config/IOCIdentifier';
import type { LocalesRepositoryInterface } from '../port/LocalesRepositoryInterface';

@injectable()
export class LocalesRepository implements LocalesRepositoryInterface {
  readonly name = 'next_app_locales';

  protected safeFields = Object.keys(localesSchema.shape);

  constructor(
    @inject(I.DBBridgeInterface) protected dbBridge: DBBridgeInterface,
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
}
