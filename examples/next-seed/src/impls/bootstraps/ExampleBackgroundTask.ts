import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

/**
 * Empty sample for the client background-task convention.
 *
 * Real tasks should expose `start` / `stop` / `enqueue*` and register here via
 * {@link BootstrapClient.getPlugins}. See `docs/client-background-plugin.md`.
 *
 * This stub only proves the Bootstrap hook; it does not run timers or I/O.
 */
class ExampleBackgroundTaskImpl {
  protected started = false;

  public start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
  }

  public stop(): void {
    this.started = false;
  }

  /**
   * Business code should only enqueue; drain belongs inside the task.
   */
  public enqueue(_item: unknown): void {
    // Intentionally empty — replace with an in-memory / persisted queue.
  }
}

const exampleBackgroundTaskImpl = new ExampleBackgroundTaskImpl();

export const exampleBackgroundTask: BootstrapExecutorPlugin = {
  pluginName: 'ExampleBackgroundTask',
  onBefore() {
    exampleBackgroundTaskImpl.start();
  }
};

export { exampleBackgroundTaskImpl };
