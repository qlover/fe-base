import { inject, injectable } from 'inversify';
import { AdminLocalesService } from '@/server/services/AdminLocalesService';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import {
  ApiLocaleService,
  type ImportLocalesData
} from '../services/ApiLocaleService';
import {
  LocalesImportValidator,
  LocalesValidator
} from '../validators/LocalesValidator';
import { PaginationValidator } from '../validators/PaginationValidator';
import type { AdminLocalesControllerInterface } from '../port/AdminLocalesControllerInterface';
import type { BridgeOrderBy } from '../port/DBBridgeInterface';
import type { UpsertResult } from '../port/LocalesRepositoryInterface';
import type { PaginationInterface } from '../port/PaginationInterface';
import type { ValidatorInterface } from '../port/ValidatorInterface';

@injectable()
export class AdminLocalesController implements AdminLocalesControllerInterface {
  constructor(
    @inject(AdminLocalesService)
    protected adminLocalesService: AdminLocalesService,
    @inject(PaginationValidator)
    protected paginationValidator: ValidatorInterface,
    @inject(ApiLocaleService)
    protected apiLocaleService: ApiLocaleService,
    @inject(LocalesValidator)
    protected localesValidator: ValidatorInterface,
    @inject(LocalesImportValidator)
    protected localesImportValidator: ValidatorInterface
  ) {}

  async getLocales(query: {
    page: number;
    pageSize: number;
    orders?: BridgeOrderBy;
  }): Promise<PaginationInterface<LocalesSchema>> {
    const paginationParams =
      this.paginationValidator.getThrow<typeof query>(query);

    const result = await this.apiLocaleService.getLocales({
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
      orderBy: paginationParams?.orders
    });

    return result;
  }

  async createLocale(
    body: Omit<LocalesSchema, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean }> {
    const localesParams =
      this.localesValidator.getThrow<Partial<LocalesSchema>>(body);

    await this.apiLocaleService.create(localesParams);

    return {
      success: true
    };
  }
  async updateLocale(body: Partial<LocalesSchema>): Promise<void> {
    const localesParams =
      this.localesValidator.getThrow<Partial<LocalesSchema>>(body);

    await this.apiLocaleService.update(localesParams);
  }
  async importLocales(formData: unknown): Promise<UpsertResult> {
    const localesParams =
      this.localesImportValidator.getThrow<ImportLocalesData>({
        values: formData
      });

    const result = await this.apiLocaleService.importLocales(localesParams);

    return result;
  }
}
