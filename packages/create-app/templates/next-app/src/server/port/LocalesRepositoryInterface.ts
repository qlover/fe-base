import type { DBTableInterface } from '@/server/port/DBTableInterface';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';

export interface LocalesRepositoryInterface extends DBTableInterface {
  getLocales(localeName: string): Promise<LocalesSchema[]>;

  add(params: LocalesSchema): Promise<LocalesSchema[] | null>;

  updateById(
    id: number,
    params: Partial<Omit<LocalesSchema, 'id' | 'created_at'>>
  ): Promise<void>;
}
