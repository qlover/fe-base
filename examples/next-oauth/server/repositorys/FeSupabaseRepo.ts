import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  SupabaseRepo,
  toStableApiExecutorError
} from '@qlover/next-kit/server';
import { API_SERVER_ERROR } from '@config/i18n-identifier/api';

/**
 * App `SupabaseRepo` that remaps kit infrastructure error ids
 * (`SupabasePGRSTError`, …) to {@link API_SERVER_ERROR} before they bubble.
 *
 * Bind the same instance to both `FeSupabaseRepo` and `SupabaseRepo` tokens
 * so `@inject(SupabaseRepo)` gets the remap (Auth / non-builder paths).
 */
export class FeSupabaseRepo<Raw, T = Raw> extends SupabaseRepo<Raw, T> {
  /**
   * @override
   */
  public override throwIfError(
    ...args: Parameters<SupabaseRepo<Raw, T>['throwIfError']>
  ): void {
    try {
      super.throwIfError(...args);
    } catch (error) {
      if (error instanceof ExecutorError) {
        throw toStableApiExecutorError(error);
      }
      throw new ExecutorError(API_SERVER_ERROR, { cause: error });
    }
  }
}
