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
import type { PaginationParams } from '../validators/PaginationValidator';

@injectable()
export class AdminLocalesController implements AdminLocalesControllerInterface {
  constructor(
    @inject(AdminLocalesService)
    protected adminLocalesService: AdminLocalesService,
    @inject(PaginationValidator)
    protected paginationValidator: ValidatorInterface<PaginationParams>,
    @inject(ApiLocaleService)
    protected apiLocaleService: ApiLocaleService,
    @inject(LocalesValidator)
    protected localesValidator: ValidatorInterface<Partial<LocalesSchema>>,
    @inject(LocalesImportValidator)
    protected localesImportValidator: ValidatorInterface<ImportLocalesData>
  ) {}

  public async getLocales(query: {
    page: number;
    pageSize: number;
    orders?: BridgeOrderBy;
  }): Promise<PaginationInterface<LocalesSchema>> {
    const paginationParams = await this.paginationValidator.getThrow(query);

    const result = await this.apiLocaleService.getLocales({
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
      orderBy: paginationParams?.orders
    });

    return result;
  }

  public async createLocale(
    body: Omit<LocalesSchema, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean }> {
    const localesParams = await this.localesValidator.getThrow(body);

    await this.apiLocaleService.create(localesParams);

    return {
      success: true
    };
  }
  public async updateLocale(body: Partial<LocalesSchema>): Promise<void> {
    await this.apiLocaleService.update(body);
  }
  public async importLocales(formData: unknown): Promise<UpsertResult> {
    const localesParams = await this.localesImportValidator.getThrow({
      values: formData
    });

    const result = await this.apiLocaleService.importLocales(localesParams);

    return result;
  }
}
