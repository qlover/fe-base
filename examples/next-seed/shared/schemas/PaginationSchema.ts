import { z } from 'zod';
import { API_PAGE_INVALID } from '@config/i18n-identifier/api';

const paginationNumberSchema = z
  .number()
  .or(z.string())
  .transform((val) => Number(val))
  .refine((val) => val > 0, {
    message: API_PAGE_INVALID
  });

export const paginationSchema = z.object({
  page: paginationNumberSchema,
  pageSize: paginationNumberSchema.optional().default(10),
  orderBy: z.string().optional(),
  order: z.string().optional().default('0')
});

export type PaginationSchema = z.infer<typeof paginationSchema>;
