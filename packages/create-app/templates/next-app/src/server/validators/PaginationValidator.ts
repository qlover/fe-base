import { z } from 'zod';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import { API_PAGE_INVALID } from '@config/Identifier';
import {
  type ValidationFaildResult,
  type ValidatorInterface
} from '../port/ValidatorInterface';

const numberSchema = z
  .number()
  .or(z.string())
  .transform((val) => Number(val))
  .refine((val) => val > 0, {
    message: API_PAGE_INVALID
  });

const paginationSchema = z.object({
  page: numberSchema,
  pageSize: numberSchema.optional().default(10)
});

export class PaginationValidator implements ValidatorInterface {
  protected defaultPageSize = 10;

  validate(data: unknown): void | ValidationFaildResult {
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

  getThrow(
    data: unknown
  ): Pick<PaginationInterface<unknown>, 'page' | 'pageSize'> {
    const result = paginationSchema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }

    return {
      page: result.data.page,
      pageSize: result.data.pageSize
    };
  }
}
