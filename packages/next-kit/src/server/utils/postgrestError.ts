/**
 * Helpers for PostgREST / Supabase error payloads nested under ExecutorError.
 */

export type PostgrestErrorShape = {
  code?: string;
  message?: string;
};

export function extractPostgrestError(
  error: unknown
): PostgrestErrorShape | null {
  const visit = (node: unknown, depth = 0): PostgrestErrorShape | null => {
    if (!node || typeof node !== 'object' || depth > 5) {
      return null;
    }

    const obj = node as Record<string, unknown>;
    if (typeof obj.code === 'string' && obj.code.startsWith('PGRST')) {
      return {
        code: obj.code,
        message: typeof obj.message === 'string' ? obj.message : undefined
      };
    }

    if (obj.cause) {
      return visit(obj.cause, depth + 1);
    }

    return null;
  };

  return visit(error);
}

export function parsePostgrestRowCount(message: string): number | undefined {
  const match = message.match(/only (\d+) rows?/i);
  if (!match) {
    return undefined;
  }

  const total = Number(match[1]);
  return Number.isFinite(total) ? total : undefined;
}

export function isPostgrestRangeNotSatisfiable(error: unknown): boolean {
  const pg = extractPostgrestError(error);
  return pg?.code === 'PGRST103';
}
