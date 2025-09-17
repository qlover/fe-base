import { z } from 'zod';
import { API_PAGE_INVALID } from '@config/Identifier';
import type { PaginationInterface } from '@/base/port/PaginationInterface';
import {
  type ValidationFaildResult,
  type ValidatorInterface
} from '../port/ValidatorInterface';

const pageSchema = z
  .number()
  .or(z.string())
  .transform((val) => Number(val))
  .refine((val) => val > 0, {
    message: API_PAGE_INVALID
  });

export class PaginationValidator implements ValidatorInterface {
  protected defaultPageSize = 10;

  validatePageSize(value: unknown): void | ValidationFaildResult {
    const result = pageSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0];
    }
  }

  validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: 'form is required'
      };
    }

    return this.validatePageSize((data as Record<string, unknown>).page);
  }

  getThrow(
    data: unknown
  ): Pick<PaginationInterface<unknown>, 'page' | 'pageSize'> {
    const result = this.validate(data);
    if (result) {
      throw new Error(result.message);
    }

    return { page: 1, pageSize: 10 };
  }
}
