import { z } from 'zod';

/**
 * Optional fields shared by all search-result payloads; aligns with
 * non-`items` keys on {@link ResourceSearchResult} in `@qlover/corekit-bridge`.
 */
export const searchResultOptionalFieldsSchema = z.object({
  total: z.number().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  nextCursor: z.string().nullable().optional(),
  prevCursor: z.string().nullable().optional(),
  hasMore: z.boolean().optional(),
  facets: z.unknown().optional(),
  meta: z.unknown().optional()
});

/**
 * Builds a Zod schema for {@link ResourceSearchResult} with a given row/item schema.
 */
export function searchResultSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z
    .object({
      items: z.array(itemSchema)
    })
    .extend(searchResultOptionalFieldsSchema.shape);
}

/**
 * Loose validation when item shape is not fixed (e.g. generic JSON APIs).
 */
export const searchResultUnknownItemsSchema = z
  .object({
    items: z.array(z.unknown())
  })
  .extend(searchResultOptionalFieldsSchema.shape);

/** Inferred shape when `items` are not narrowed (unknown rows). */
export type SearchResultSchema = z.infer<typeof searchResultUnknownItemsSchema>;
