import { z } from 'zod';

const CORS_HTTP_METHODS = [
  '*',
  'GET',
  'POST',
  'OPTIONS',
  'PUT',
  'DELETE',
  'PATCH'
] as const;

/**
 * CORS Origin: `*` or absolute http(s) origin (no path/query/hash).
 */
export function isValidCorsOriginValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed === '*') {
    return true;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    if (url.username || url.password) {
      return false;
    }
    if (url.pathname !== '/' && url.pathname !== '') {
      return false;
    }
    if (url.search || url.hash) {
      return false;
    }
    return Boolean(url.host);
  } catch {
    return false;
  }
}

export function isValidCorsPathValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (trimmed === '*') {
    return true;
  }
  return trimmed.startsWith('/');
}

export function corsRuleIdentity(rule: {
  origin: string;
  path: string;
  methods: readonly string[];
}): string {
  const methods = [...rule.methods]
    .map((method) => method.trim().toUpperCase())
    .filter(Boolean)
    .sort()
    .join(',');
  return `${rule.origin.trim()}|${rule.path.trim()}|${methods}`;
}

export const corsOriginSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isValidCorsOriginValue, {
    message:
      'Origin must be * or a valid http(s) origin without path/query/hash'
  });

export const corsPathSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isValidCorsPathValue, {
    message: 'Path must be * or start with /'
  });

export const corsMethodSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.enum(CORS_HTTP_METHODS));

/** One CORS rule row (future `fe_cors_rules` row shape). */
export const corsRuleSchema = z.object({
  origin: corsOriginSchema,
  path: corsPathSchema,
  methods: z.array(corsMethodSchema).min(1)
});

/**
 * Stored value for `api.cors_rules`: array of rules, no duplicates.
 */
export const corsValueSchema = z
  .array(corsRuleSchema)
  .superRefine((rules, ctx) => {
    const seen = new Set<string>();
    for (let index = 0; index < rules.length; index += 1) {
      const rule = rules[index]!;
      const key = corsRuleIdentity(rule);
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate CORS rule (origin + path + methods)',
          path: [index]
        });
        continue;
      }
      seen.add(key);
    }
  });

export type CorsRuleValue = z.infer<typeof corsRuleSchema>;
export type CorsValue = z.infer<typeof corsValueSchema>;
