/**
 * Schedule work after the HTTP response is sent. Failures must not affect
 * the main request.
 */
export interface BackgroundTaskSchedulerInterface {
  /**
   * @param label - Label used in error logs
   * @param task - Async work; thrown errors are logged only
   */
  schedule(label: string, task: () => Promise<void>): void;
}
