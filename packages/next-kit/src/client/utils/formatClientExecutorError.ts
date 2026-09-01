import { ExecutorError } from '@qlover/fe-corekit/executor';
import { isI18nKey } from '../../common/schemas/i18nKey';

/**
 * Resolve API / ExecutorError for inline UI (i18n id → translated text).
 */
export function formatClientExecutorError(
  error: unknown,
  t: (key: string) => string
): string | null {
  if (error == null) {
    return null;
  }
  if (error instanceof ExecutorError && isI18nKey(error.id)) {
    return t(error.id);
  }
  if (error instanceof Error) {
    if (isI18nKey(error.message)) {
      return t(error.message);
    }
    return error.message;
  }
  return String(error);
}
