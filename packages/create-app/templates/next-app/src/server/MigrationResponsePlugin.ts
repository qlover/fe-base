import type { MigrationResult } from '@/base/port/DBMigrationInterface';
import type { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';

export class MigrationResponsePlugin implements ExecutorPlugin {
  readonly pluginName = 'MigrationResponsePlugin';

  onSuccess(context: ExecutorContext<unknown>): void | Promise<void> {
    const returnValue = context.returnValue as MigrationResult;

    if (returnValue.success) {
    }
  }
}
