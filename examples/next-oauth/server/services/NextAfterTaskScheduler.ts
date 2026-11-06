import { after } from 'next/server';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { BackgroundTaskSchedulerInterface } from '@server/interfaces/BackgroundTaskSchedulerInterface';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Next.js `after()` scheduler: keep the serverless isolate alive until the
 * task finishes without blocking the response body.
 */
@injectable()
export class NextAfterTaskScheduler implements BackgroundTaskSchedulerInterface {
  constructor(
    @inject(I.Logger)
    protected readonly logger: LoggerInterface
  ) {}

  /**
   * @override
   */
  public schedule(label: string, task: () => Promise<void>): void {
    after(async () => {
      try {
        await task();
      } catch (error) {
        this.logger.error(`background task failed: ${label}`, { error });
      }
    });
  }
}
