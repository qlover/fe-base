import type {
  ValidationFaildResult,
  ValidatorInterface
} from '@shared/validators/ValidatorInterface';
import { paginationSchema } from '@schemas/PaginationSchema';
import type { BridgeOrderBy } from '../interfaces/DBBridgeInterface';

export type PaginationParams = {
  page: number;
  pageSize: number;
  orders?: BridgeOrderBy;
};

export class PaginationValidator implements ValidatorInterface<PaginationParams> {
  protected defaultPageSize = 10;

  /**
   * @override
   */
  public validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: 'form is required'
      };
    }

    const result = paginationSchema.safeParse(data);
    if (!result.success) {
      return result.error.issues[0];
    }
  }

  /**
   * @override
   */
  public getThrow<T>(data: unknown): T {
    const result = paginationSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }

    const order = result.data.order;

    return {
      page: result.data.page,
      pageSize: result.data.pageSize,
      orders: [
        result.data.orderBy || 'updated_at',
        order == '0' || order == '1' ? (+order as 0 | 1) : 0
      ] as BridgeOrderBy
    } as T;
  }
}
