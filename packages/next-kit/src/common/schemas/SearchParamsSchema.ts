import { z } from 'zod';

/**
 * One sort level; aligns with {@link ResourceSortClause} in `@qlover/corekit-bridge`.
 */
export const resourceSortClauseSchema = z.object({
  orderBy: z.string(),
  order: z.unknown().optional()
});

/**
 * Portable search/list query shape; aligns with {@link ResourceSearchParams}.
 * `z.looseObject()` allows unknown keys (app-specific criteria extensions).
 */
export const searchParamsSchema = z.looseObject({
  page: z.int().positive().optional(),
  pageSize: z.int().positive().optional(),
  offset: z.int().nonnegative().optional(),
  cursor: z.string().nullable().optional(),
  keyword: z.string().optional(),
  filters: z.unknown().optional(),
  sort: z.array(resourceSortClauseSchema).optional()
});

export type SearchParamsSchema = z.infer<typeof searchParamsSchema>;
